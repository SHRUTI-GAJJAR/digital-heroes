const express = require("express");

const {
  getMySubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  updateSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  deleteSubscription
} = require("../controllers/subscriptionController");

const { initiatePayment } = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin routes
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllSubscriptions
);

router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateSubscriptionStatus
);

// User routes
router.get(
  "/",
  protect,
  getMySubscriptions
);

router.get(
  "/:id",
  protect,
  getSubscriptionById
);

router.post(
  "/",
  protect,
  initiatePayment
);

router.put(
  "/:id",
  protect,
  updateSubscription
);

router.patch(
  "/:id/cancel",
  protect,
  cancelSubscription
);

router.delete(
  "/:id",
  protect,
  deleteSubscription
);

module.exports = router;