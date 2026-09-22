const express = require("express");

const {
  getCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
  toggleCharityStatus,
  toggleFeaturedCharity
} = require("../controllers/charityController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// PUBLIC ROUTES

router.get("/", getCharities);

router.get("/:id", getCharityById);


// ADMIN ROUTES

router.post(
  "/",
  protect,
  adminOnly,
  createCharity
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateCharity
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCharity
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  toggleCharityStatus
);

router.patch(
  "/:id/featured",
  protect,
  adminOnly,
  toggleFeaturedCharity
);


module.exports = router;