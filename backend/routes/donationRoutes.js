const express = require("express");

const {
  getMyDonations,
  getDonationById,
  createDonation,
  getAllDonations,
  getAdminDonationById
} = require("../controllers/donationController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin routes
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllDonations
);

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getAdminDonationById
);

// User routes
router.get(
  "/",
  protect,
  getMyDonations
);

router.get(
  "/:id",
  protect,
  getDonationById
);

router.post(
  "/",
  protect,
  createDonation
);

module.exports = router;