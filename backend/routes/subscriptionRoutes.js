const express = require("express");

const {
  getMySubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  deleteSubscription
} = require("../controllers/subscriptionController");

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
  createSubscription
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