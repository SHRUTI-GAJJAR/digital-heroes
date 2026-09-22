const express = require("express");

const {
  getDashboardSummary,
  getSubscriptionReport,
  getWinnerReport,
  getCharityReport,
  getDrawReport
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardSummary);
router.get("/subscriptions", getSubscriptionReport);
router.get("/winners", getWinnerReport);
router.get("/charities", getCharityReport);
router.get("/draws", getDrawReport);

module.exports = router;