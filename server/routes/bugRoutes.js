const express = require("express");

const {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  searchBugs,
} = require("../controllers/bugController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Search bugs - protected
router.get("/search", protect, searchBugs);

// Get bug by ID - protected
router.get("/:id", protect, getBugById);

// Update bug - protected
router.put("/:id", protect, updateBug);

// Create bug - protected
router.post("/", protect, createBug);

// Get all bugs - protected
router.get("/", protect, getBugs);

module.exports = router;
