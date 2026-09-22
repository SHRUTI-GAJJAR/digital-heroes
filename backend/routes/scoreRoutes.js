const express = require("express");

const {
  getMyScores,
  getScoreById,
  createScore,
  updateScore,
  deleteScore
} = require("../controllers/scoreController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// All score routes require login
router.use(protect);


// GET MY SCORES
router.get("/", getMyScores);


// GET SINGLE SCORE
router.get("/:id", getScoreById);


// CREATE SCORE
router.post("/", createScore);


// UPDATE SCORE
router.put("/:id", updateScore);


// DELETE SCORE
router.delete("/:id", deleteScore);


module.exports = router;