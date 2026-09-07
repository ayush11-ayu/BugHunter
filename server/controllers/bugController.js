const Bug = require("../models/Bug");
const Activity = require("../models/Activity");

// Create a new bug
const createBug = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      priority,
      severity,
      environment,
      stepsToReproduce,
      expectedResult,
      actualResult,
      tags,
    } = req.body;

    if (!title || !description || !project) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and project are required",
      });
    }

    const tagArray =
      typeof tags === "string"
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
        : Array.isArray(tags)
        ? tags
        : [];

    const bug = await Bug.create({
      title,
      description,
      project,
      priority,
      severity,
      environment,
      stepsToReproduce,
      expectedResult,
      actualResult,
      tags: tagArray,
    });

    res.status(201).json({
      success: true,
      message: "Bug created successfully",
      bug,
    });
  } catch (error) {
    console.error("Create bug error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create bug",
      error: error.message,
    });
  }
};

// Get bugs with filters
const getBugs = async (req, res) => {
  try {
    const { status, priority, severity } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (severity) {
      filter.severity = severity;
    }

    const bugs = await Bug.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bugs.length,
      bugs,
    });
  } catch (error) {
    console.error("Get bugs error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bugs",
      error: error.message,
    });
  }
};

// Get a single bug by ID
const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    res.status(200).json({
      success: true,
      bug,
    });
  } catch (error) {
    console.error("Get bug by ID error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bug",
      error: error.message,
    });
  }
};

// Update a bug
const updateBug = async (req, res) => {
  try {
    const {
      status,
      priority,
      severity,
      assignedTo,
    } = req.body;

    const currentRole = req.user?.role;

    // Get the existing bug first
    const existingBug = await Bug.findById(req.params.id);

    if (!existingBug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    const updateData = {};

    // Status can be changed only by admin, manager, or developer
    if (status !== undefined) {
      if (
        currentRole !== "admin" &&
        currentRole !== "manager" &&
        currentRole !== "developer"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You cannot change bug status.",
        });
      }

      updateData.status = status;
    }

    // Priority can currently be changed by any authenticated user
    if (priority !== undefined) {
      updateData.priority = priority;
    }

    // Severity can currently be changed by any authenticated user
    if (severity !== undefined) {
      updateData.severity = severity;
    }

    // Assignment can be changed only by admin or manager
    if (assignedTo !== undefined) {
      if (
        currentRole !== "admin" &&
        currentRole !== "manager"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You cannot assign bugs.",
        });
      }

      updateData.assignedTo = assignedTo || null;
    }

    const bug = await Bug.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    // Automatically create activity when status changes
    if (
      status !== undefined &&
      existingBug.status !== bug.status
    ) {
      try {
        await Activity.create({
          bug: bug._id,
          user: req.user.userId,
          action: "Status Changed",
          description: `Bug status changed from ${existingBug.status} to ${bug.status}`,
        });
      } catch (activityError) {
        console.error(
          "Create status activity error:",
          activityError.message
        );
      }
    }

    // Automatically create activity when priority changes
    if (
      priority !== undefined &&
      existingBug.priority !== bug.priority
    ) {
      try {
        await Activity.create({
          bug: bug._id,
          user: req.user.userId,
          action: "Priority Changed",
          description: `Bug priority changed from ${existingBug.priority} to ${bug.priority}`,
        });
      } catch (activityError) {
        console.error(
          "Create priority activity error:",
          activityError.message
        );
      }
    }

    // Automatically create activity when severity changes
    if (
      severity !== undefined &&
      existingBug.severity !== bug.severity
    ) {
      try {
        await Activity.create({
          bug: bug._id,
          user: req.user.userId,
          action: "Severity Changed",
          description: `Bug severity changed from ${existingBug.severity} to ${bug.severity}`,
        });
      } catch (activityError) {
        console.error(
          "Create severity activity error:",
          activityError.message
        );
      }
    }

    // Automatically create activity when assignment changes
    if (
      assignedTo !== undefined &&
      String(existingBug.assignedTo || "") !==
        String(bug.assignedTo || "")
    ) {
      try {
        let oldAssignment = "Unassigned";
        let newAssignment = "Unassigned";

        if (existingBug.assignedTo) {
          const oldUser = await require("../models/User").findById(
            existingBug.assignedTo
          );

          if (oldUser) {
            oldAssignment = oldUser.name;
          }
        }

        if (bug.assignedTo) {
          const newUser = await require("../models/User").findById(
            bug.assignedTo
          );

          if (newUser) {
            newAssignment = newUser.name;
          }
        }

        await Activity.create({
          bug: bug._id,
          user: req.user.userId,
          action: "Assignment Changed",
          description: `Bug assigned from ${oldAssignment} to ${newAssignment}`,
        });
      } catch (activityError) {
        console.error(
          "Create assignment activity error:",
          activityError.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Bug updated successfully",
      bug,
    });
  } catch (error) {
    console.error("Update bug error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update bug",
      error: error.message,
    });
  }
};

// Search bugs
const searchBugs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchTerm = q.trim();

    const bugs = await Bug.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { project: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bugs.length,
      bugs,
    });
  } catch (error) {
    console.error("Search bugs error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to search bugs",
      error: error.message,
    });
  }
};

module.exports = {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  searchBugs,
};
