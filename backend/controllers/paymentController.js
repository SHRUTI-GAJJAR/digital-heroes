const crypto = require("crypto");
const supabase = require("../config/supabase");
const {
  buildCheckoutPayload,
  isFailedStatus,
  isSuccessfulStatus,
  validateResponseHash,
  verifyPayment
} = require("../services/payuService");
const { createSubscriptionDonation } = require("../services/donationService");

const PAYU_CURRENCY = "INR";

const amountString = (amount) => Number(amount).toFixed(2);

const requiredConfiguration = () => {
  const names = [
    "PAYU_MERCHANT_KEY",
    "PAYU_MERCHANT_SALT",
    "PAYU_SUCCESS_URL",
    "PAYU_FAILURE_URL",
    "PAYU_CANCEL_URL",
    "FRONTEND_URL"
  ];
  const missing = names.filter((name) => !process.env[name]);

  if (missing.length) {
    throw new Error(`Missing PayU configuration: ${missing.join(", ")}`);
  }
};

const frontendResultUrl = (result, transactionId) => {
  const url = new URL(process.env.FRONTEND_URL || "http://localhost:5173");
  url.pathname = "/subscription";
  url.searchParams.set("payment", result);
  if (transactionId) url.searchParams.set("txnid", transactionId);
  return url.toString();
};

const redirectResult = (res, result, transactionId) =>
  res.redirect(303, frontendResultUrl(result, transactionId));

const renewalDate = (planType, startDate) => {
  const date = new Date(startDate);
  date.setUTCMonth(date.getUTCMonth() + (planType === "yearly" ? 12 : 1));
  return date.toISOString();
};

const findPayment = async (transactionId) => {
  const { data: payment, error } = await supabase
    .from("payments")
    .select("*, subscriptions (*)")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (error) throw error;
  return payment;
};

const callbackMatchesPayment = (payload, payment) =>
  payload?.key === process.env.PAYU_MERCHANT_KEY &&
  payload?.txnid === payment.transaction_id &&
  amountString(payload.amount) === amountString(payment.amount) &&
  validateResponseHash(payload);

const updatePayment = async (transactionId, updates) => {
  const { data, error } = await supabase
    .from("payments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("transaction_id", transactionId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

const markUnsuccessful = async (payment, status, payload, reason) => {
  if (payment.status === "success") return payment;

  return updatePayment(payment.transaction_id, {
    status,
    response_data: payload,
    failure_reason: reason || payload.error_Message || payload.error_message || null
  });
};

const fulfillSuccessfulPayment = async (payment, payload) => {
  const verification = await verifyPayment({
    transactionId: payment.transaction_id,
    expectedAmount: payment.amount
  });

  if (!verification.confirmed) {
    await updatePayment(payment.transaction_id, {
      status: "verification_pending",
      provider_payment_id: verification.providerPaymentId,
      response_data: { callback: payload, verification: verification.response },
      failure_reason: "Payment could not be confirmed by PayU"
    });
    return { confirmed: false };
  }

  const subscription = payment.subscriptions;
  if (!subscription) {
    throw new Error("Payment subscription was not found");
  }

  const paidAt = new Date().toISOString();
  const startDate = subscription.start_date || paidAt;
  const nextRenewalDate = subscription.renewal_date || renewalDate(subscription.plan_type, startDate);

  await updatePayment(payment.transaction_id, {
    status: "verification_pending",
    provider_payment_id: verification.providerPaymentId,
    response_data: { callback: payload, verification: verification.response },
    failure_reason: null
  });

  await createSubscriptionDonation(subscription);

  const { data: activatedSubscription, error: activationError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      start_date: startDate,
      renewal_date: nextRenewalDate
    })
    .eq("id", subscription.id)
    .neq("status", "cancelled")
    .select("*")
    .single();

  if (activationError) throw activationError;

  await updatePayment(payment.transaction_id, {
    status: "success",
    provider_payment_id: verification.providerPaymentId,
    response_data: { callback: payload, verification: verification.response },
    paid_at: paidAt,
    failure_reason: null
  });

  return { confirmed: true, subscription: activatedSubscription };
};

const initiatePayment = async (req, res) => {
  try {
    requiredConfiguration();

    const {
      plan_type,
      amount,
      charity_id,
      charity_percentage = 10,
      renewal_date,
      phone
    } = req.body;
    const subscriptionAmount = Number(amount);
    const percentage = Number(charity_percentage);

    if (!['monthly', 'yearly'].includes(plan_type)) {
      return res.status(400).json({ success: false, message: "Plan type must be monthly or yearly" });
    }
    if (!Number.isFinite(subscriptionAmount) || subscriptionAmount <= 0) {
      return res.status(400).json({ success: false, message: "Subscription amount must be greater than 0" });
    }
    if (!Number.isFinite(percentage) || percentage < 10 || percentage > 100) {
      return res.status(400).json({ success: false, message: "Charity contribution must be between 10% and 100%" });
    }
    if (!charity_id) {
      return res.status(400).json({ success: false, message: "Charity selection is required" });
    }
    if (!/^\+?[0-9]{10,15}$/.test(String(phone || "").replace(/[\s()-]/g, ""))) {
      return res.status(400).json({ success: false, message: "A valid phone number is required for payment" });
    }

    const { data: charity, error: charityError } = await supabase
      .from("charities")
      .select("id, name, is_active")
      .eq("id", charity_id)
      .single();

    if (charityError || !charity) {
      return res.status(404).json({ success: false, message: "Charity not found" });
    }
    if (!charity.is_active) {
      return res.status(400).json({ success: false, message: "Selected charity is not active" });
    }

    const { data: existingSubscription, error: existingError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingError) throw existingError;
    if (existingSubscription) {
      return res.status(409).json({ success: false, message: "User already has an active subscription" });
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: req.user.id,
        plan_type,
        amount: subscriptionAmount,
        currency: PAYU_CURRENCY,
        status: "inactive",
        charity_id,
        charity_percentage: percentage,
        renewal_date: renewal_date || null
      })
      .select("*")
      .single();

    if (subscriptionError) throw subscriptionError;

    const transactionId = `DH-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: req.user.id,
      subscription_id: subscription.id,
      provider: "payu",
      transaction_id: transactionId,
      amount: subscriptionAmount,
      currency: PAYU_CURRENCY,
      status: "pending"
    });

    if (paymentError) {
      await supabase.from("subscriptions").delete().eq("id", subscription.id).eq("status", "inactive");
      throw paymentError;
    }

    const payment = buildCheckoutPayload({
      transactionId,
      amount: subscriptionAmount,
      productInfo: `Digital Heroes ${plan_type} subscription`,
      firstName: req.user.name.split(" ")[0],
      email: req.user.email,
      phone: String(phone).replace(/[\s()-]/g, ""),
      successUrl: process.env.PAYU_SUCCESS_URL,
      failureUrl: process.env.PAYU_FAILURE_URL,
      cancelUrl: process.env.PAYU_CANCEL_URL
    });

    return res.status(201).json({
      success: true,
      message: "Payment prepared",
      subscription_id: subscription.id,
      transaction_id: transactionId,
      payment
    });
  } catch (error) {
    console.error("Initiate PayU payment error:", error);
    return res.status(500).json({ success: false, message: "Unable to prepare payment" });
  }
};

const processCallback = async (req, res, callbackType) => {
  const payload = req.body || {};
  const transactionId = payload.txnid;

  try {
    if (!transactionId) return redirectResult(res, "failed");

    const payment = await findPayment(transactionId);
    if (!payment || !callbackMatchesPayment(payload, payment)) {
      return redirectResult(res, "failed", transactionId);
    }

    if (isSuccessfulStatus(payload.status)) {
      const result = await fulfillSuccessfulPayment(payment, payload);
      return redirectResult(res, result.confirmed ? "success" : "pending", transactionId);
    }

    if (isFailedStatus(payload.status, payload.unmappedstatus)) {
      await markUnsuccessful(
        payment,
        callbackType === "cancel" ? "cancelled" : "failed",
        payload,
        payload.error_Message || payload.error_message
      );
      return redirectResult(res, callbackType === "cancel" ? "cancelled" : "failed", transactionId);
    }

    await updatePayment(transactionId, {
      status: "verification_pending",
      response_data: payload,
      failure_reason: "PayU returned a pending payment status"
    });
    return redirectResult(res, "pending", transactionId);
  } catch (error) {
    console.error("PayU callback error:", error);
    return redirectResult(res, "pending", transactionId);
  }
};

const successCallback = (req, res) => processCallback(req, res, "success");
const failureCallback = (req, res) => processCallback(req, res, "failure");
const cancelCallback = (req, res) => processCallback(req, res, "cancel");

const webhook = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.txnid) return res.status(400).json({ success: false, message: "Transaction ID is required" });

    const payment = await findPayment(payload.txnid);
    if (!payment || !callbackMatchesPayment(payload, payment)) {
      return res.status(400).json({ success: false, message: "Invalid payment notification" });
    }

    if (isSuccessfulStatus(payload.status)) {
      const result = await fulfillSuccessfulPayment(payment, payload);
      return res.status(result.confirmed ? 200 : 202).json({ success: result.confirmed });
    }

    if (isFailedStatus(payload.status, payload.unmappedstatus)) {
      await markUnsuccessful(payment, "failed", payload, payload.error_Message || payload.error_message);
      return res.status(200).json({ success: true });
    }

    await updatePayment(payload.txnid, {
      status: "verification_pending",
      response_data: payload,
      failure_reason: "PayU returned a pending payment status"
    });
    return res.status(202).json({ success: true });
  } catch (error) {
    console.error("PayU webhook error:", error);
    return res.status(500).json({ success: false, message: "Unable to process payment notification" });
  }
};

module.exports = {
  initiatePayment,
  successCallback,
  failureCallback,
  cancelCallback,
  webhook
};
