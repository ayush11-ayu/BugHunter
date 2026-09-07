const Bug = require("../models/Bug");
const AIAnalysis = require("../models/AIAnalysis");

// Request AI analysis and save it to MongoDB
const requestAIAnalysis = async (req, res) => {
  try {
    const { bugId } = req.params;

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    const response = await fetch(
      `${process.env.AI_SERVICE_URL}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: bug.title || "",
          description: bug.description || "",
          environment: bug.environment || "",
          stepsToReproduce: bug.stepsToReproduce || "",
          expectedResult: bug.expectedResult || "",
          actualResult: bug.actualResult || "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service returned status ${response.status}`
      );
    }

    const aiResult = await response.json();

    if (!aiResult.success || !aiResult.analysis) {
      throw new Error("Invalid response from AI service");
    }

    const aiData = aiResult.analysis;

    const analysis = await AIAnalysis.findOneAndUpdate(
      { bug: bug._id },
      {
        bug: bug._id,
        category: aiData.category || "",
        priorityRecommendation:
          ["Low", "Medium", "High", "Critical"].includes(
            aiData.priority
          )
            ? aiData.priority
            : "Medium",
        severityRecommendation:
          ["Minor", "Major", "Critical", "Blocker"].includes(
            aiData.severity
          )
            ? aiData.severity
            : "Major",
        summary: aiData.summary || "",
        possibleCause: aiData.possibleCause || "",
        suggestedFix: aiData.suggestedFix || "",
        confidence:
          typeof aiData.confidence === "number"
            ? aiData.confidence
            : 0,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    bug.aiAnalysis = analysis._id;
    await bug.save();

    res.status(200).json({
      success: true,
      message: "AI analysis generated and saved successfully",
      analysis,
    });
  } catch (error) {
    console.error(
      "Request AI analysis error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to generate AI analysis",
      error: error.message,
    });
  }
};


// Get AI analysis for a bug
const getAIAnalysis = async (req, res) => {
  try {
    const { bugId } = req.params;

    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    const analysis = await AIAnalysis.findOne({
      bug: bugId,
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "AI analysis not found for this bug",
      });
    }

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error(
      "Get AI analysis error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch AI analysis",
      error: error.message,
    });
  }
};


// ============================================================
// DUPLICATE BUG DETECTION
// ============================================================

const checkDuplicateBug = async (req, res) => {
  try {
    const { bugId } = req.params;

    // Find the bug we want to check
    const bug = await Bug.findById(bugId);

    if (!bug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    // Get other bugs from MongoDB
    const existingBugs = await Bug.find({
      _id: { $ne: bug._id },
    })
      .select("_id title description")
      .sort({ createdAt: -1 })
      .limit(50);

    // Convert MongoDB records into the format
    // expected by the Python AI service
    const duplicateCandidates = existingBugs.map(
      (existingBug) => ({
        id: existingBug._id.toString(),
        title: existingBug.title || "",
        description: existingBug.description || "",
      })
    );

    // Send bug + existing bugs to Python AI service
    const response = await fetch(
      `${process.env.AI_SERVICE_URL}/duplicate-check`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: bug.title || "",
          description: bug.description || "",
          existingBugs: duplicateCandidates,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI duplicate service returned status ${response.status}`
      );
    }

    const duplicateResult = await response.json();

    if (!duplicateResult.success) {
      throw new Error(
        "Invalid response from duplicate detection service"
      );
    }

    res.status(200).json({
      success: true,
      message: "Duplicate bug check completed successfully",
      bugId: bug._id,
      isDuplicate: duplicateResult.isDuplicate,
      matches: duplicateResult.matches || [],
    });
  } catch (error) {
    console.error(
      "Duplicate bug check error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to check for duplicate bugs",
      error: error.message,
    });
  }
};


module.exports = {
  requestAIAnalysis,
  getAIAnalysis,
  checkDuplicateBug,
};