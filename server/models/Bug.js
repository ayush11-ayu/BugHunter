const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    project: {
      type: String,
      required: true,
      trim: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Resolved",
        "Closed",
        "Reopened",
      ],
      default: "Open",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    severity: {
      type: String,
      enum: ["Minor", "Major", "Critical", "Blocker"],
      default: "Minor",
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    environment: {
      type: String,
      default: "",
      trim: true,
    },

    stepsToReproduce: {
      type: String,
      default: "",
      trim: true,
    },

    expectedResult: {
      type: String,
      default: "",
      trim: true,
    },

    actualResult: {
      type: String,
      default: "",
      trim: true,
    },

    attachments: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    aiAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIAnalysis",
      default: null,
    },
  },
  {
    timestamps: true,
}
);

const Bug = mongoose.model("Bug", bugSchema);

module.exports = Bug;