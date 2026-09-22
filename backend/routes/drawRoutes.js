const express = require("express");

const {
  getDraws,
  getDrawById,
  createDraw,
  updateDraw,
  deleteDraw,
  simulateDraw,
  publishDraw,
  completeDraw
} = require("../controllers/drawController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();


// Public draw information

router.get("/", getDraws);

router.get("/:id", getDrawById);


// Admin draw management

router.post(
  "/",
  protect,
  adminOnly,
  createDraw
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateDraw
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteDraw
);

router.post(
  "/:id/simulate",
  protect,
  adminOnly,
  simulateDraw
);

router.post(
  "/:id/publish",
  protect,
  adminOnly,
  publishDraw
);

router.post(
  "/:id/complete",
  protect,
  adminOnly,
  completeDraw
);


module.exports = router;