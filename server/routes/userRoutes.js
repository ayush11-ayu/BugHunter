const express = require("express");

const {
  getUsers,
  getUserById,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users - protected
router.get("/", protect, getUsers);

// Get user by ID - protected
router.get("/:id", protect, getUserById);

module.exports = router;
