const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const service = require("../services/payuService");

const basePayload = {
  key: "test-key",
  txnid: "DH-test-1",
  amount: "10.00",
  productinfo: "Digital Heroes monthly subscription",
  firstname: "Test",
  email: "test@example.com",
  phone: "9999999999",
  status: "success",
  udf1: "",
  udf2: "",
  udf3: "",
  udf4: "",
  udf5: ""
};

function responseHash(payload, salt) {
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
    Number(payload.amount).toFixed(2),
    payload.txnid,
    payload.key
  ];
  return crypto
    .createHash("sha512")
    .update(`${salt}|${values[0]}||||||${values.slice(1).join("|")}`)
    .digest("hex");
}

test("buildCheckoutPayload creates PayU hosted fields without exposing salt", () => {
  process.env.PAYU_MERCHANT_KEY = "test-key";
  process.env.PAYU_MERCHANT_SALT = "test-salt";
  process.env.PAYU_PAYMENT_URL = "https://test.payu.in/_payment";

  const checkout = service.buildCheckoutPayload({
    transactionId: basePayload.txnid,
    amount: 10,
    productInfo: basePayload.productinfo,
    firstName: basePayload.firstname,
    email: basePayload.email,
    phone: basePayload.phone,
    successUrl: "https://example.test/success",
    failureUrl: "https://example.test/failure",
    cancelUrl: "https://example.test/cancel"
  });

  assert.equal(checkout.action, "https://test.payu.in/_payment");
  assert.equal(checkout.fields.amount, "10.00");
  assert.equal(checkout.fields.key, "test-key");
  assert.equal(checkout.fields.hash.length, 128);
  assert.equal(Object.values(checkout.fields).includes("test-salt"), false);
});

test("validateResponseHash accepts an authentic PayU response and rejects tampering", () => {
  process.env.PAYU_MERCHANT_SALT = "test-salt";
  const payload = { ...basePayload };
  payload.hash = responseHash(payload, "test-salt");

  assert.equal(service.validateResponseHash(payload), true);
  assert.equal(service.validateResponseHash({ ...payload, amount: "11.00" }), false);
  assert.equal(service.validateResponseHash({ ...payload, key: "other-key" }), false);
});

test("payment status helpers classify success, failure, cancellation, and pending", () => {
  assert.equal(service.isSuccessfulStatus("success"), true);
  assert.equal(service.isSuccessfulStatus("failure"), false);
  assert.equal(service.isFailedStatus("failure", "failed"), true);
  assert.equal(service.isFailedStatus("pending", "userCancelled"), true);
  assert.equal(service.isFailedStatus("pending", "pending"), false);
});

test("verifyPayment confirms matching success and rejects amount mismatch", async () => {
  process.env.PAYU_MERCHANT_KEY = "test-key";
  process.env.PAYU_MERCHANT_SALT = "test-salt";
  process.env.PAYU_VERIFY_URL = "https://test.payu.in/merchant/postservice.php?form=2";
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      status: 1,
      transaction_details: {
        "DH-test-1": {
          txnid: "DH-test-1",
          amt: "10.00",
          status: "success",
          mihpayid: "mih-test-1"
        }
      }
    })
  });

  try {
    const confirmed = await service.verifyPayment({ transactionId: "DH-test-1", expectedAmount: 10 });
    const rejected = await service.verifyPayment({ transactionId: "DH-test-1", expectedAmount: 11 });
    assert.equal(confirmed.confirmed, true);
    assert.equal(confirmed.providerPaymentId, "mih-test-1");
    assert.equal(rejected.confirmed, false);
  } finally {
    global.fetch = originalFetch;
  }
});
