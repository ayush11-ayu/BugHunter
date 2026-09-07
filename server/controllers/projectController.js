const Project = require("../models/Project");

// Create a new project
const createProject = async (req, res) => {
  try {
    const { name, description, status, createdBy } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      status,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get one project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project by ID error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
};
