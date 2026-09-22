const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const backendRoot = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(backendRoot, relativePath), "utf8");

test("authentication routes expose registration, login, and protected current-user access", () => {
  const source = read("routes/authRoutes.js");
  assert.match(source, /router\.post\("\/register", registerUser\)/);
  assert.match(source, /router\.post\("\/login", loginUser\)/);
  assert.match(source, /router\.get\("\/me", protect, getMe\)/);
});

test("member resource routes keep authentication boundaries", () => {
  assert.match(read("routes/scoreRoutes.js"), /router\.use\(protect\)/);
  assert.match(read("routes/donationRoutes.js"), /router\.post\([\s\S]*protect[\s\S]*createDonation/);
  assert.match(read("routes/subscriptionRoutes.js"), /router\.post\([\s\S]*protect[\s\S]*initiatePayment/);
  assert.match(read("routes/winnerRoutes.js"), /router\.get\([\s\S]*"\/",[\s\S]*protect[\s\S]*getMyWinners/);
});

test("public and admin resource route boundaries remain explicit", () => {
  assert.match(read("routes/charityRoutes.js"), /router\.get\("\/", getCharities\)/);
  assert.match(read("routes/drawRoutes.js"), /router\.get\("\/", getDraws\)/);
  assert.match(read("routes/charityRoutes.js"), /protect,[\s\S]*adminOnly,[\s\S]*createCharity/);
  assert.match(read("routes/drawRoutes.js"), /protect,[\s\S]*adminOnly,[\s\S]*createDraw/);
  assert.match(read("routes/reportRoutes.js"), /router\.use\(protect, adminOnly\)/);
});

test("PayU callbacks are public form endpoints while initiation is protected", () => {
  const source = read("routes/paymentRoutes.js");
  assert.match(source, /router\.post\("\/payu\/initiate", protect, initiatePayment\)/);
  assert.match(source, /router\.post\("\/payu\/success", successCallback\)/);
  assert.match(source, /router\.post\("\/payu\/failure", failureCallback\)/);
  assert.match(source, /router\.post\("\/payu\/cancel", cancelCallback\)/);
  assert.match(source, /router\.post\("\/payu\/webhook", webhook\)/);
  assert.match(read("server.js"), /express\.urlencoded\(\{ extended: false \}\)/);
});

test("subscription activation and donation are payment-gated", () => {
  const subscriptionSource = read("controllers/subscriptionController.js");
  const paymentSource = read("controllers/paymentController.js");
  assert.match(subscriptionSource, /status: "inactive"/);
  assert.doesNotMatch(subscriptionSource, /createSubscriptionDonation\(subscription\)/);
  assert.match(paymentSource, /await verifyPayment\(/);
  assert.match(paymentSource, /await createSubscriptionDonation\(subscription\)/);
  assert.match(paymentSource, /status: "active"/);
});
