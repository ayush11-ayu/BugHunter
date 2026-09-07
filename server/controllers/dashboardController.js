const Bug = require("../models/Bug");
const Project = require("../models/Project");

// Get dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalBugs,
      openBugs,
      inProgressBugs,
      resolvedBugs,
      closedBugs,
      reopenedBugs,
      totalProjects,
    ] = await Promise.all([
      Bug.countDocuments(),
      Bug.countDocuments({ status: "Open" }),
      Bug.countDocuments({ status: "In Progress" }),
      Bug.countDocuments({ status: "Resolved" }),
      Bug.countDocuments({ status: "Closed" }),
      Bug.countDocuments({ status: "Reopened" }),
      Project.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalBugs,
        openBugs,
        inProgressBugs,
        resolvedBugs,
        closedBugs,
        reopenedBugs,
        totalProjects,
      },
    });
  } catch (error) {
    console.error(
      "Get dashboard summary error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
};

// Get bugs grouped by status
const getBugStatusStats = async (req, res) => {
  try {
    const statusStats = await Bug.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: statusStats,
    });
  } catch (error) {
    console.error(
      "Get bug status stats error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch bug status statistics",
      error: error.message,
    });
  }
};

// Get bugs grouped by priority
const getBugPriorityStats = async (req, res) => {
  try {
    const priorityStats = await Bug.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: priorityStats,
    });
  } catch (error) {
    console.error(
      "Get bug priority stats error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch bug priority statistics",
      error: error.message,
    });
  }
};

// Get project health statistics
const getProjectHealth = async (req, res) => {
  try {
    const projectHealth = await Bug.aggregate([
      {
        $group: {
          _id: "$project",
          totalBugs: { $sum: 1 },
          openBugs: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Open"] },
                1,
                0,
              ],
            },
          },
          inProgressBugs: {
            $sum: {
              $cond: [
                { $eq: ["$status", "In Progress"] },
                1,
                0,
              ],
            },
          },
          resolvedBugs: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Resolved"] },
                1,
                0,
              ],
            },
          },
          criticalBugs: {
            $sum: {
              $cond: [
                { $eq: ["$priority", "Critical"] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          totalBugs: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      projects: projectHealth,
    });
  } catch (error) {
    console.error(
      "Get project health error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch project health statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardSummary,
  getBugStatusStats,
  getBugPriorityStats,
  getProjectHealth,
};
