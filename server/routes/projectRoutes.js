const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
} = require("../controllers/projectController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all projects - protected
router.get("/", protect, getProjects);

// Get project by ID - protected
router.get("/:id", protect, getProjectById);

// Create project - protected
router.post("/", protect, createProject);

module.exports = router;
