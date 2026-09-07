const Bug = require("../models/Bug");

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
    const { status, priority, severity, assignedTo } = req.body;

    const currentRole = req.user?.role;

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

    // Priority and severity can currently be changed
    // by any authenticated user
    if (priority !== undefined) {
      updateData.priority = priority;
    }

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