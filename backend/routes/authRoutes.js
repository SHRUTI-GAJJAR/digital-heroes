const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  setupAdmin
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);

router.post("/login", loginUser);

// TEMPORARY ADMIN SETUP
router.post("/setup-admin", setupAdmin);

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;