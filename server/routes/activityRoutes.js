const express = require("express");

const {
  createActivity,
  getActivities,
} = require("../controllers/activityController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create activity - protected
router.post(
  "/bugs/:bugId/activities",
  protect,
  createActivity
);

// Get activities for a bug - protected
router.get(
  "/bugs/:bugId/activities",
  protect,
  getActivities
);

module.exports = router;
