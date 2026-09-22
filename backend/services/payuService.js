const crypto = require("crypto");

const TEST_PAYMENT_URL = "https://test.payu.in/_payment";
const TEST_VERIFY_URL = "https://test.payu.in/merchant/postservice.php?form=2";

const amountString = (amount) => Number(amount).toFixed(2);

const sha512 = (value) =>
  crypto.createHash("sha512").update(value, "utf8").digest("hex");

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ""), "utf8");
  const rightBuffer = Buffer.from(String(right || ""), "utf8");

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const requestHash = (params, salt) => {
  const values = [
    params.key,
    params.txnid,
    amountString(params.amount),
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1,
    params.udf2,
    params.udf3,
    params.udf4,
    params.udf5
  ].map((value) => value ?? "");

  return sha512(`${values.join("|")}||||||${salt}`);
};

const responseHash = (payload, salt) => {
  const values = [
    payload.status,
    payload.udf5,
    payload.udf4,
    payload.udf3,
    payload.udf2,
    payload.udf1,
    payload.email,
    payload.firstname,
    payload.productinfo,
    amountString(payload.amount),
    payload.txnid,
    payload.key
  ].map((value) => value ?? "");
  const additionalCharges = payload.additionalCharges || payload.additional_charges;
  const prefix = additionalCharges ? `${additionalCharges}|` : "";

  return sha512(`${prefix}${salt}|${values[0]}||||||${values.slice(1).join("|")}`);
};

const validateResponseHash = (payload) => {
  const salt = process.env.PAYU_MERCHANT_SALT;
  if (!salt || !payload?.hash) return false;

  return safeEqual(responseHash(payload, salt), payload.hash);
};

const isSuccessfulStatus = (status) =>
  String(status || "").toLowerCase() === "success";

const isFailedStatus = (status, unmappedStatus) => {
  const normalizedStatus = String(status || "").toLowerCase();
  const normalizedUnmapped = String(unmappedStatus || "").toLowerCase();

  return (
    normalizedStatus === "failure" ||
    ["failed", "usercancelled", "dropped", "bounced"].includes(normalizedUnmapped)
  );
};

const buildCheckoutPayload = ({
  transactionId,
  amount,
  productInfo,
  firstName,
  email,
  phone,
  successUrl,
  failureUrl,
  cancelUrl
}) => {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;

  if (!key || !salt) {
    throw new Error("PayU merchant credentials are not configured");
  }

  const payload = {
    key,
    txnid: transactionId,
    amount: amountString(amount),
    productinfo: productInfo,
    firstname: firstName,
    email,
    phone,
    surl: successUrl,
    furl: failureUrl,
    curl: cancelUrl,
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: ""
  };

  return {
    action: process.env.PAYU_PAYMENT_URL || TEST_PAYMENT_URL,
    fields: {
      ...payload,
      hash: requestHash(payload, salt)
    }
  };
};

const verifyPayment = async ({ transactionId, expectedAmount }) => {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  const verifyUrl = process.env.PAYU_VERIFY_URL || TEST_VERIFY_URL;

  if (!key || !salt) {
    throw new Error("PayU merchant credentials are not configured");
  }

  const hash = sha512(`${key}|verify_payment|${transactionId}|${salt}`);
  const body = new URLSearchParams({
    key,
    command: "verify_payment",
    var1: transactionId,
    hash
  });
  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error(`PayU verification returned HTTP ${response.status}`);
  }

  const result = await response.json();
  const details = result?.transaction_details?.[transactionId];
  const verifiedAmount = details?.amt ?? details?.amount;
  const verifiedTransactionId = details?.txnid;

  return {
    confirmed:
      result?.status === 1 &&
      isSuccessfulStatus(details?.status) &&
      (!verifiedTransactionId || safeEqual(verifiedTransactionId, transactionId)) &&
      amountString(verifiedAmount) === amountString(expectedAmount),
    providerPaymentId: details?.mihpayid || null,
    response: result,
    details
  };
};

module.exports = {
  buildCheckoutPayload,
  isFailedStatus,
  isSuccessfulStatus,
  validateResponseHash,
  verifyPayment
};
