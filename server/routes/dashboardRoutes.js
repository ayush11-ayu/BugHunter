const express = require("express");

const {
  getDashboardSummary,
  getBugStatusStats,
  getBugPriorityStats,
  getProjectHealth,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard summary
router.get(
  "/summary",
  protect,
  getDashboardSummary
);

// Bugs grouped by status
router.get(
  "/bug-status",
  protect,
  getBugStatusStats
);

// Bugs grouped by priority
router.get(
  "/bug-priority",
  protect,
  getBugPriorityStats
);

// Project health
router.get(
  "/project-health",
  protect,
  getProjectHealth
);

module.exports = router;
