const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    bug: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      required: true,
      unique: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    priorityRecommendation: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    severityRecommendation: {
      type: String,
      enum: ["Minor", "Major", "Critical", "Blocker"],
      default: "Major",
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    possibleCause: {
      type: String,
      default: "",
      trim: true,
    },

    suggestedFix: {
      type: String,
      default: "",
      trim: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const AIAnalysis = mongoose.model(
  "AIAnalysis",
  aiAnalysisSchema
);

module.exports = AIAnalysis;