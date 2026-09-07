const express = require("express");

const {
  createComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create comment - protected
router.post("/bugs/:bugId/comments", protect, createComment);

// Get comments for a bug - protected
router.get("/bugs/:bugId/comments", protect, getComments);

// Delete comment - protected
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
