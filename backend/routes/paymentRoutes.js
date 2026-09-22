const express = require("express");
const {
  initiatePayment,
  successCallback,
  failureCallback,
  cancelCallback,
  webhook
} = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/payu/initiate", protect, initiatePayment);
router.post("/payu/success", successCallback);
router.post("/payu/failure", failureCallback);
router.post("/payu/cancel", cancelCallback);
router.post("/payu/webhook", webhook);

module.exports = router;
