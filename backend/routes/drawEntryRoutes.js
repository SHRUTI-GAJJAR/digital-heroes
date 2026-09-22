const express = require("express");

const {
  getMyDrawEntry,
  getDrawEntries,
  createEntry,
  deleteEntry
} = require("../controllers/drawEntryController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// USER

router.get(
  "/:drawId/my",
  protect,
  getMyDrawEntry
);

router.post(
  "/:drawId",
  protect,
  createEntry
);

router.delete(
  "/:drawId",
  protect,
  deleteEntry
);


// ADMIN

router.get(
  "/:drawId",
  protect,
  adminOnly,
  getDrawEntries
);


module.exports = router;