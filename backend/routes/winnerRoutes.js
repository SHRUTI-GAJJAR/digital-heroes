const express = require("express");

const {
  getMyWinners,
  getWinnerById,
  getAllWinners,
  uploadWinnerProof,
  getWinnerProof,
  verifyWinner,
  markWinnerPaid,
  deleteWinner
} = require("../controllers/winnerController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Admin routes
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllWinners
);

router.patch(
  "/admin/:id/verify",
  protect,
  adminOnly,
  verifyWinner
);

router.patch(
  "/admin/:id/pay",
  protect,
  adminOnly,
  markWinnerPaid
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteWinner
);

// User routes
router.get(
  "/",
  protect,
  getMyWinners
);

router.get(
  "/:id",
  protect,
  getWinnerById
);

router.post(
  "/:id/proof",
  protect,
  upload.single("proof"),
  uploadWinnerProof
);

router.get(
  "/:id/proof",
  protect,
  getWinnerProof
);

module.exports = router;