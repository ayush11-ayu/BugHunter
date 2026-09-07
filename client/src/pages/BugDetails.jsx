import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getBugById,
  updateBug,
} from "../services/bugService";

import {
  createComment,
  getComments,
  deleteComment,
} from "../services/commentService";

import { getActivities } from "../services/activityService";

import {
  analyzeBug,
  getAIAnalysis,
  checkDuplicateBug,
} from "../services/aiService";

import api from "../services/api";

import {
  canAssignBugs,
  canChangeBugStatus,
} from "../utils/permissionUtils";

import { getCurrentUser } from "../utils/authUtils";

function BugDetails() {
  const { id } = useParams();

  const currentUser = getCurrentUser();

  // ============================================================
  // STATE
  // ============================================================

  const [bug, setBug] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [aiAnalysis, setAIAnalysis] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [severity, setSeverity] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [commentText, setCommentText] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(true);

  const [aiAnalyzing, setAIAnalyzing] = useState(false);
  const [duplicateChecking, setDuplicateChecking] = useState(false);

  const [saving, setSaving] = useState(false);
  const [commentSaving, setCommentSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [aiError, setAIError] = useState("");
  const [duplicateError, setDuplicateError] = useState("");

  // ============================================================
  // PERMISSIONS
  // ============================================================

  const canAssign = canAssignBugs();
  const canChangeStatus = canChangeBugStatus();

  // ============================================================
  // LOAD BUG, COMMENTS, ACTIVITIES AND USERS
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = [
          getBugById(id),
          getComments(id),
          getActivities(id),
        ];

        if (canAssign) {
          requests.push(api.get("/users"));
        }

        const results = await Promise.all(requests);

        const bugResult = results[0];
        const commentsResult = results[1];
        const activitiesResult = results[2];
        const usersResult = results[3];

        const loadedBug = bugResult.bug;

        if (!loadedBug) {
          throw new Error("Bug not found");
        }

        setBug(loadedBug);

        setComments(
          commentsResult?.comments || []
        );

        setActivities(
          activitiesResult?.activities || []
        );

        if (usersResult) {
          setUsers(
            usersResult.data?.users || []
          );
        }

        setStatus(loadedBug.status || "");
        setPriority(loadedBug.priority || "");
        setSeverity(loadedBug.severity || "");
        setAssignedTo(
          loadedBug.assignedTo || ""
        );
      } catch (error) {
        console.error(
          "Load bug details error:",
          error
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load bug details."
        );
      } finally {
        setLoading(false);
        setCommentsLoading(false);
        setActivitiesLoading(false);
      }
    };

    loadData();
  }, [id, canAssign]);

  // ============================================================
  // LOAD AI ANALYSIS
  // ============================================================

  useEffect(() => {
    const loadAIAnalysis = async () => {
      try {
        setAILoading(true);
        setAIError("");

        const result = await getAIAnalysis(id);

        setAIAnalysis(
          result.analysis || null
        );
      } catch (error) {
        if (error.response?.status === 404) {
          setAIAnalysis(null);
        } else {
          console.error(
            "Load AI analysis error:",
            error
          );

          setAIError(
            error.response?.data?.message ||
              "Failed to load AI analysis."
          );
        }
      } finally {
        setAILoading(false);
      }
    };

    loadAIAnalysis();
  }, [id]);

  // ============================================================
  // AI BUG ANALYSIS
  // ============================================================

  const handleAnalyzeBug = async () => {
    try {
      setAIAnalyzing(true);
      setAIError("");
      setMessage("");

      const result = await analyzeBug(id);

      setAIAnalysis(
        result.analysis || null
      );

      setMessage(
        "AI analysis generated successfully!"
      );
    } catch (error) {
      console.error(
        "AI analysis error:",
        error
      );

      setAIError(
        error.response?.data?.message ||
          "Failed to generate AI analysis."
      );
    } finally {
      setAIAnalyzing(false);
    }
  };

  // ============================================================
  // APPLY AI RECOMMENDATION
  // ============================================================

  const handleApplyAIRecommendation = async (
    field,
    value
  ) => {
    if (!value) {
      return;
    }

    try {
      setSaving(true);
      setAIError("");
      setError("");
      setMessage("");

      const updateData = {
        [field]: value,
      };

      const result = await updateBug(
        id,
        updateData
      );

      setBug(result.bug);

      setStatus(result.bug.status);
      setPriority(result.bug.priority);
      setSeverity(result.bug.severity);
      setAssignedTo(
        result.bug.assignedTo || ""
      );

      setMessage(
        `${
          field === "priority"
            ? "Priority"
            : "Severity"
        } applied from AI recommendation.`
      );

      const activitiesResult =
        await getActivities(id);

      setActivities(
        activitiesResult.activities || []
      );
    } catch (error) {
      console.error(
        "Apply AI recommendation error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to apply AI recommendation."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DUPLICATE BUG DETECTION
  // ============================================================

  const handleCheckDuplicates = async () => {
    try {
      setDuplicateChecking(true);
      setDuplicateError("");
      setDuplicateResult(null);

      const result =
        await checkDuplicateBug(id);

      setDuplicateResult(result);
    } catch (error) {
      console.error(
        "Duplicate bug check error:",
        error
      );

      setDuplicateError(
        error.response?.data?.message ||
          "Failed to check for duplicate bugs."
      );
    } finally {
      setDuplicateChecking(false);
    }
  };

  // ============================================================
  // UPDATE BUG
  // ============================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const updateData = {
        priority,
        severity,
      };

      if (canChangeStatus) {
        updateData.status = status;
      }

      if (canAssign) {
        updateData.assignedTo = assignedTo;
      }

      const result = await updateBug(
        id,
        updateData
      );

      setBug(result.bug);

      setStatus(result.bug.status);
      setPriority(result.bug.priority);
      setSeverity(result.bug.severity);
      setAssignedTo(
        result.bug.assignedTo || ""
      );

      setMessage(
        "Bug updated successfully!"
      );

      const activitiesResult =
        await getActivities(id);

      setActivities(
        activitiesResult.activities || []
      );
    } catch (error) {
      console.error(
        "Update bug error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update bug. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ADD COMMENT
  // ============================================================

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      setCommentError(
        "Comment cannot be empty."
      );
      return;
    }

    try {
      setCommentSaving(true);
      setCommentError("");

      const result = await createComment(
        id,
        commentText.trim()
      );

      setComments((previousComments) => [
        ...previousComments,
        result.comment,
      ]);

      setCommentText("");
    } catch (error) {
      console.error(
        "Create comment error:",
        error
      );

      setCommentError(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setCommentSaving(false);
    }
  };

  // ============================================================
  // DELETE COMMENT
  // ============================================================

  const handleDeleteComment = async (
    commentId
  ) => {
    try {
      setCommentError("");

      await deleteComment(commentId);

      setComments((previousComments) =>
        previousComments.filter(
          (comment) =>
            comment._id !== commentId
        )
      );
    } catch (error) {
      console.error(
        "Delete comment error:",
        error
      );

      setCommentError(
        error.response?.data?.message ||
          "Failed to delete comment."
      );
    }
  };

  // ============================================================
  // ACTIVITY STYLES
  // ============================================================

  const getActivityStyle = (action) => {
    if (action === "Status Changed") {
      return {
        border: "1px solid #bfdbfe",
        backgroundColor: "#eff6ff",
        color: "#1e3a8a",
      };
    }

    if (action === "Priority Changed") {
      return {
        border: "1px solid #ddd6fe",
        backgroundColor: "#f5f3ff",
        color: "#4c1d95",
      };
    }

    if (action === "Severity Changed") {
      return {
        border: "1px solid #fed7aa",
        backgroundColor: "#fff7ed",
        color: "#9a3412",
      };
    }

    if (action === "Assignment Changed") {
      return {
        border: "1px solid #a7f3d0",
        backgroundColor: "#ecfdf5",
        color: "#065f46",
      };
    }

    return {
      border: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb",
      color: "#374151",
    };
  };

  const getActivityLabel = (action) => {
    if (action === "Status Changed") {
      return "STATUS";
    }

    if (action === "Priority Changed") {
      return "PRIORITY";
    }

    if (action === "Severity Changed") {
      return "SEVERITY";
    }

    if (action === "Assignment Changed") {
      return "ASSIGNMENT";
    }

    return "ACTIVITY";
  };

  // ============================================================
  // COMMON STYLES
  // ============================================================

  const cardStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  };

  const aiCardStyle = {
    border: "1px solid #c7d2fe",
    backgroundColor: "#f8faff",
    padding: "24px",
    marginTop: "16px",
    marginBottom: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 3px 10px rgba(30, 41, 59, 0.06)",
  };

  const aiBadgeStyle = {
    display: "inline-block",
    padding: "5px 11px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: "600",
  };

  const duplicateCardStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "12px",
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <p>Loading bug details...</p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error && !bug) {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        <p
          style={{
            color: "#b91c1c",
            backgroundColor: "#fef2f2",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          {error}
        </p>

        <Link to="/bugs">
          <button type="button">
            Back to Bugs
          </button>
        </Link>
      </div>
    );
  }

  if (!bug) {
    return <p>Bug not found.</p>;
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px 20px 60px",
        color: "#1f2937",
      }}
    >
      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <Link
        to="/bugs"
        style={{
          textDecoration: "none",
        }}
      >
        <button
          type="button"
          style={{
            backgroundColor: "#f8fafc",
            color: "#334155",
            border: "1px solid #cbd5e1",
            padding: "9px 16px",
            borderRadius: "7px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back to Bugs
        </button>
      </Link>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          marginTop: "24px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          {bug.title}
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          <strong>Bug ID:</strong>{" "}
          {bug._id}
        </p>
      </div>

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <div
        style={{
          ...cardStyle,
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            color: "#1e293b",
            marginTop: 0,
          }}
        >
          Description
        </h2>

        <p
          style={{
            lineHeight: "1.7",
            color: "#475569",
          }}
        >
          {bug.description}
        </p>

        <p>
          <strong>Project:</strong>{" "}
          <span style={{ color: "#475569" }}>
            {bug.project}
          </span>
        </p>
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e2e8f0",
          margin: "25px 0",
        }}
      />

      {/* ======================================================
          UPDATE BUG
      ====================================================== */}

      <div style={cardStyle}>
        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          Update Bug
        </h2>

        {message && (
          <p
            style={{
              color: "#047857",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "10px 12px",
              borderRadius: "7px",
            }}
          >
            <strong>{message}</strong>
          </p>
        )}

        {error && (
          <p
            style={{
              color: "#b91c1c",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              padding: "10px 12px",
              borderRadius: "7px",
            }}
          >
            <strong>Error:</strong>{" "}
            {error}
          </p>
        )}

        <form onSubmit={handleUpdate}>
          {/* STATUS */}

          <div>
            <label>
              <strong>Status:</strong>
            </label>

            <br />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={!canChangeStatus}
              style={{
                marginTop: "6px",
                padding: "9px",
                borderRadius: "7px",
                border: "1px solid #cbd5e1",
                minWidth: "220px",
              }}
            >
              <option value="Open">
                Open
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Closed">
                Closed
              </option>

              <option value="Reopened">
                Reopened
              </option>
            </select>

            {!canChangeStatus && (
              <p>
                <small
                  style={{
                    color: "#64748b",
                  }}
                >
                  You do not have permission
                  to change bug status.
                </small>
              </p>
            )}
          </div>

          <br />

          {/* PRIORITY */}

          <div>
            <label>
              <strong>Priority:</strong>
            </label>

            <br />

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              style={{
                marginTop: "6px",
                padding: "9px",
                borderRadius: "7px",
                border: "1px solid #cbd5e1",
                minWidth: "220px",
              }}
            >
              <option value="Low">
                Low
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Critical">
                Critical
              </option>
            </select>
          </div>

          <br />

          {/* SEVERITY */}

          <div>
            <label>
              <strong>Severity:</strong>
            </label>

            <br />

            <select
              value={severity}
              onChange={(event) =>
                setSeverity(event.target.value)
              }
              style={{
                marginTop: "6px",
                padding: "9px",
                borderRadius: "7px",
                border: "1px solid #cbd5e1",
                minWidth: "220px",
              }}
            >
              <option value="Minor">
                Minor
              </option>

              <option value="Major">
                Major
              </option>

              <option value="Critical">
                Critical
              </option>

              <option value="Blocker">
                Blocker
              </option>
            </select>
          </div>

          {/* ASSIGNMENT */}

          {canAssign && (
            <>
              <br />

              <div>
                <label>
                  <strong>
                    Assigned To:
                  </strong>
                </label>

                <br />

                <select
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(
                      event.target.value
                    )
                  }
                  style={{
                    marginTop: "6px",
                    padding: "9px",
                    borderRadius: "7px",
                    border:
                      "1px solid #cbd5e1",
                    minWidth: "260px",
                  }}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <br />

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "7px",
              cursor: saving
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </form>
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e2e8f0",
          margin: "25px 0",
        }}
      />

      {/* ======================================================
          BUG INFORMATION
      ====================================================== */}

      <div style={cardStyle}>
        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          Bug Information
        </h2>

        <p>
          <strong>Status:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: "600",
            }}
          >
            {bug.status}
          </span>
        </p>

        <p>
          <strong>Priority:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "#fff7ed",
              color: "#c2410c",
              fontWeight: "600",
            }}
          >
            {bug.priority}
          </span>
        </p>

        <p>
          <strong>Severity:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              fontWeight: "600",
            }}
          >
            {bug.severity}
          </span>
        </p>

        <p>
          <strong>Assigned To:</strong>{" "}
          {bug.assignedTo
            ? users.find(
                (user) =>
                  user._id ===
                  bug.assignedTo
              )?.name ||
              bug.assignedTo
            : "Unassigned"}
        </p>

        {bug.environment && (
          <div>
            <p>
              <strong>
                Environment:
              </strong>
            </p>

            <p
              style={{
                color: "#475569",
              }}
            >
              {bug.environment}
            </p>
          </div>
        )}

        {bug.stepsToReproduce && (
          <div>
            <p>
              <strong>
                Steps to Reproduce:
              </strong>
            </p>

            <pre
              style={{
                backgroundColor: "#f8fafc",
                padding: "14px",
                borderRadius: "8px",
                border:
                  "1px solid #e2e8f0",
                overflowX: "auto",
                color: "#475569",
              }}
            >
              {bug.stepsToReproduce}
            </pre>
          </div>
        )}

        {bug.expectedResult && (
          <div>
            <p>
              <strong>
                Expected Result:
              </strong>
            </p>

            <p
              style={{
                color: "#475569",
              }}
            >
              {bug.expectedResult}
            </p>
          </div>
        )}

        {bug.actualResult && (
          <div>
            <p>
              <strong>
                Actual Result:
              </strong>
            </p>

            <p
              style={{
                color: "#475569",
              }}
            >
              {bug.actualResult}
            </p>
          </div>
        )}

        {bug.tags &&
          bug.tags.length > 0 && (
            <div>
              <p>
                <strong>Tags:</strong>
              </p>

              <p
                style={{
                  color: "#475569",
                }}
              >
                {bug.tags.join(", ")}
              </p>
            </div>
          )}

        <p
          style={{
            color: "#64748b",
          }}
        >
          <strong>Created:</strong>{" "}
          {new Date(
            bug.createdAt
          ).toLocaleString()}
        </p>

        <p
          style={{
            color: "#64748b",
          }}
        >
          <strong>
            Last Updated:
          </strong>{" "}
          {new Date(
            bug.updatedAt
          ).toLocaleString()}
        </p>
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e2e8f0",
          margin: "25px 0",
        }}
      />

      {/* ======================================================
          AI BUG ANALYSIS
      ====================================================== */}

      <div style={aiCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#312e81",
              }}
            >
              🤖 AI Bug Analysis
            </h2>

            <p
              style={{
                color: "#64748b",
                marginBottom: 0,
              }}
            >
              Let BugHunter analyze this bug
              and provide recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeBug}
            disabled={aiAnalyzing}
            style={{
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              border: "none",
              padding: "11px 18px",
              borderRadius: "8px",
              cursor: aiAnalyzing
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
              opacity: aiAnalyzing
                ? 0.7
                : 1,
            }}
          >
            {aiAnalyzing
              ? "Analyzing Bug..."
              : "Analyze Bug with AI"}
          </button>
        </div>

        {aiError && (
          <p
            style={{
              marginTop: "18px",
              color: "#b91c1c",
              backgroundColor: "#fef2f2",
              border:
                "1px solid #fecaca",
              padding: "11px",
              borderRadius: "7px",
            }}
          >
            <strong>AI Error:</strong>{" "}
            {aiError}
          </p>
        )}

        {aiLoading ? (
          <p
            style={{
              color: "#64748b",
              marginTop: "20px",
            }}
          >
            Loading AI analysis...
          </p>
        ) : aiAnalysis ? (
          <div
            style={{
              marginTop: "22px",
              paddingTop: "20px",
              borderTop:
                "1px solid #e0e7ff",
            }}
          >
            <h3
              style={{
                color: "#1e293b",
                marginTop: 0,
              }}
            >
              AI Analysis Result
            </h3>

            {/* AI BADGES */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div>
                <strong>
                  Category:{" "}
                </strong>

                <span
                  style={{
                    ...aiBadgeStyle,
                    backgroundColor:
                      "#e0e7ff",
                    color: "#3730a3",
                  }}
                >
                  {aiAnalysis.category ||
                    "Not available"}
                </span>
              </div>

              <div>
                <strong>
                  Priority:{" "}
                </strong>

                <span
                  style={{
                    ...aiBadgeStyle,
                    backgroundColor:
                      "#fef3c7",
                    color: "#92400e",
                  }}
                >
                  {aiAnalysis.priorityRecommendation ||
                    "Not available"}
                </span>
              </div>

              <div>
                <strong>
                  Severity:{" "}
                </strong>

                <span
                  style={{
                    ...aiBadgeStyle,
                    backgroundColor:
                      "#fee2e2",
                    color: "#991b1b",
                  }}
                >
                  {aiAnalysis.severityRecommendation ||
                    "Not available"}
                </span>
              </div>

              <div>
                <strong>
                  Confidence:{" "}
                </strong>

                <span
                  style={{
                    ...aiBadgeStyle,
                    backgroundColor:
                      "#dcfce7",
                    color: "#166534",
                  }}
                >
                  {typeof aiAnalysis.confidence ===
                  "number"
                    ? `${aiAnalysis.confidence}%`
                    : "Not available"}
                </span>
              </div>
            </div>

            {/* =================================================
                AI RECOMMENDATION ACTIONS
            ================================================= */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
                padding: "14px",
                backgroundColor:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <strong
                style={{
                  width: "100%",
                  color: "#334155",
                }}
              >
                AI Recommendations
              </strong>

              <button
                type="button"
                onClick={() =>
                  handleApplyAIRecommendation(
                    "priority",
                    aiAnalysis.priorityRecommendation
                  )
                }
                disabled={
                  saving ||
                  !aiAnalysis.priorityRecommendation
                }
                style={{
                  backgroundColor:
                    "#f59e0b",
                  color: "#ffffff",
                  border: "none",
                  padding:
                    "9px 14px",
                  borderRadius: "7px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                  opacity: saving
                    ? 0.7
                    : 1,
                }}
              >
                Apply Priority:{" "}
                {aiAnalysis.priorityRecommendation ||
                  "Unavailable"}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyAIRecommendation(
                    "severity",
                    aiAnalysis.severityRecommendation
                  )
                }
                disabled={
                  saving ||
                  !aiAnalysis.severityRecommendation
                }
                style={{
                  backgroundColor:
                    "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding:
                    "9px 14px",
                  borderRadius: "7px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                  opacity: saving
                    ? 0.7
                    : 1,
                }}
              >
                Apply Severity:{" "}
                {aiAnalysis.severityRecommendation ||
                  "Unavailable"}
              </button>
            </div>

            {/* SUMMARY */}

            <div
              style={{
                backgroundColor:
                  "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  marginTop: 0,
                  color: "#312e81",
                }}
              >
                <strong>
                  Summary
                </strong>
              </p>

              <p
                style={{
                  color: "#475569",
                  lineHeight: "1.6",
                  marginBottom: 0,
                }}
              >
                {aiAnalysis.summary ||
                  "No summary available."}
              </p>
            </div>

            {/* POSSIBLE CAUSE */}

            <div
              style={{
                backgroundColor:
                  "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  marginTop: 0,
                  color: "#312e81",
                }}
              >
                <strong>
                  Possible Cause
                </strong>
              </p>

              <p
                style={{
                  color: "#475569",
                  lineHeight: "1.6",
                  marginBottom: 0,
                }}
              >
                {aiAnalysis.possibleCause ||
                  "No possible cause available."}
              </p>
            </div>

            {/* SUGGESTED FIX */}

            <div
              style={{
                backgroundColor:
                  "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "12px",
              }}
            >
              <p
                style={{
                  marginTop: 0,
                  color: "#312e81",
                }}
              >
                <strong>
                  Suggested Fix
                </strong>
              </p>

              <p
                style={{
                  color: "#475569",
                  lineHeight: "1.6",
                  marginBottom: 0,
                }}
              >
                {aiAnalysis.suggestedFix ||
                  "No suggested fix available."}
              </p>
            </div>

            {aiAnalysis.updatedAt && (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginBottom: 0,
                }}
              >
                Analysis updated:{" "}
                {new Date(
                  aiAnalysis.updatedAt
                ).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <p
            style={{
              color: "#64748b",
              marginTop: "20px",
            }}
          >
            No AI analysis has been
            generated yet.
          </p>
        )}
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e2e8f0",
          margin: "25px 0",
        }}
      />

      {/* ======================================================
          DUPLICATE BUG DETECTION
      ====================================================== */}

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                marginTop: 0,
                marginBottom: "8px",
                color: "#1e293b",
              }}
            >
              🔎 Duplicate Bug Detection
            </h2>

            <p
              style={{
                color: "#64748b",
                marginBottom: 0,
              }}
            >
              Check whether this bug is similar
              to existing bugs in BugHunter.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCheckDuplicates}
            disabled={duplicateChecking}
            style={{
              backgroundColor: "#7c3aed",
              color: "#ffffff",
              border: "none",
              padding: "11px 18px",
              borderRadius: "8px",
              cursor: duplicateChecking
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
              opacity: duplicateChecking
                ? 0.7
                : 1,
            }}
          >
            {duplicateChecking
              ? "Checking..."
              : "Check for Duplicates"}
          </button>
        </div>

        {/* DUPLICATE ERROR */}

        {duplicateError && (
          <p
            style={{
              marginTop: "18px",
              color: "#b91c1c",
              backgroundColor: "#fef2f2",
              border:
                "1px solid #fecaca",
              padding: "11px",
              borderRadius: "7px",
            }}
          >
            <strong>
              Duplicate Check Error:
            </strong>{" "}
            {duplicateError}
          </p>
        )}

        {/* DUPLICATE RESULT */}

        {duplicateResult && (
          <div
            style={{
              marginTop: "22px",
              paddingTop: "20px",
              borderTop:
                "1px solid #e2e8f0",
            }}
          >
            {duplicateResult.isDuplicate ? (
              <>
                <div
                  style={{
                    backgroundColor:
                      "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    color: "#9a3412",
                    padding: "14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <strong>
                    ⚠ Possible duplicate bug
                  </strong>

                  <p
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    BugHunter found{" "}
                    {
                      duplicateResult
                        .matches?.length || 0
                    } similar bug(s).
                  </p>
                </div>

                {duplicateResult.matches?.map(
                  (match) => (
                    <div
                      key={match.bugId}
                      style={{
                        ...duplicateCardStyle,
                        border:
                          "1px solid #fed7aa",
                      }}
                    >
                      <p
                        style={{
                          marginTop: 0,
                        }}
                      >
                        <strong>
                          Similar Bug
                        </strong>
                      </p>

                      <p
                        style={{
                          color: "#1e293b",
                          fontWeight: "600",
                        }}
                      >
                        {match.title}
                      </p>

                      <p
                        style={{
                          color: "#475569",
                          lineHeight: "1.6",
                        }}
                      >
                        {match.description}
                      </p>

                      <p
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <strong>
                          Similarity:
                        </strong>{" "}
                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "4px 9px",
                            borderRadius:
                              "999px",
                            backgroundColor:
                              "#ede9fe",
                            color:
                              "#6d28d9",
                            fontWeight:
                              "700",
                          }}
                        >
                          {match.similarity}%
                        </span>
                      </p>

                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                          marginBottom: 0,
                          marginTop: "10px",
                        }}
                      >
                        Bug ID:{" "}
                        {match.bugId}
                      </p>
                    </div>
                  )
                )}
              </>
            ) : (
              <div
                style={{
                  backgroundColor:
                    "#ecfdf5",
                  border:
                    "1px solid #a7f3d0",
                  color: "#047857",
                  padding: "14px",
                  borderRadius: "8px",
                }}
              >
                <strong>
                  ✓ No duplicate bug found
                </strong>

                <p
                  style={{
                    marginBottom: 0,
                  }}
                >
                  No sufficiently similar
                  existing bug was detected.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e2e8f0",
          margin: "25px 0",
        }}
      />

      {/* ======================================================
          COMMENTS
      ====================================================== */}

      <div style={cardStyle}>
        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          Comments
        </h2>

        {commentError && (
          <p
            style={{
              color: "#b91c1c",
              backgroundColor: "#fef2f2",
              border:
                "1px solid #fecaca",
              padding: "10px",
              borderRadius: "7px",
            }}
          >
            <strong>
              Error:
            </strong>{" "}
            {commentError}
          </p>
        )}

        <form onSubmit={handleAddComment}>
          <div>
            <label>
              <strong>
                Add Comment:
              </strong>
            </label>

            <br />

            <textarea
              value={commentText}
              onChange={(event) =>
                setCommentText(
                  event.target.value
                )
              }
              placeholder="Write your comment..."
              rows="4"
              style={{
                marginTop: "8px",
                width: "100%",
                maxWidth: "700px",
                padding: "11px",
                borderRadius: "8px",
                border:
                  "1px solid #cbd5e1",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={commentSaving}
            style={{
              backgroundColor: "#334155",
              color: "#ffffff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "7px",
              cursor: commentSaving
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
              opacity: commentSaving
                ? 0.7
                : 1,
            }}
          >
            {commentSaving
              ? "Adding Comment..."
              : "Add Comment"}
          </button>
        </form>

        <br />

        {commentsLoading ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            No comments yet.
          </p>
        ) : (
          <div>
            {comments.map((comment) => {
              const isCommentOwner =
                currentUser?._id ===
                comment.user?._id;

              const isAdmin =
                currentUser?.role ===
                "admin";

              return (
                <div
                  key={comment._id}
                  style={{
                    borderTop:
                      "1px solid #e2e8f0",
                    padding: "16px 0",
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                    }}
                  >
                    <strong>
                      {comment.user?.name ||
                        "Unknown User"}
                    </strong>{" "}
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      (
                      {comment.user?.role ||
                        "unknown"}
                      )
                    </span>
                  </p>

                  <p
                    style={{
                      color: "#475569",
                      lineHeight: "1.6",
                    }}
                  >
                    {comment.text}
                  </p>

                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "13px",
                    }}
                  >
                    {new Date(
                      comment.createdAt
                    ).toLocaleString()}
                  </p>

                  {(isCommentOwner ||
                    isAdmin) && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteComment(
                          comment._id
                        )
                      }
                      style={{
                        backgroundColor:
                          "#ffffff",
                        color: "#dc2626",
                        border:
                          "1px solid #fecaca",
                        padding:
                          "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e2e8f0",
          margin: "25px 0",
        }}
      />

      {/* ======================================================
          ACTIVITY HISTORY
      ====================================================== */}

      <div style={cardStyle}>
        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          Activity History
        </h2>

        <p
          style={{
            color: "#64748b",
          }}
        >
          <small>
            Changes made to this bug are
            recorded here automatically.
          </small>
        </p>

        {activitiesLoading ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            Loading activity history...
          </p>
        ) : activities.length === 0 ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            No activity history yet.
          </p>
        ) : (
          <div>
            {activities.map(
              (activity) => (
                <div
                  key={activity._id}
                  style={{
                    ...getActivityStyle(
                      activity.action
                    ),
                    padding: "14px",
                    marginBottom:
                      "12px",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      marginTop: 0,
                    }}
                  >
                    <span
                      style={{
                        display:
                          "inline-block",
                        padding:
                          "4px 9px",
                        borderRadius:
                          "999px",
                        backgroundColor:
                          "rgba(255,255,255,0.7)",
                        fontSize: "12px",
                        fontWeight: "700",
                        letterSpacing:
                          "0.5px",
                      }}
                    >
                      {getActivityLabel(
                        activity.action
                      )}
                    </span>
                  </p>

                  <p>
                    <strong>
                      {activity.user
                        ?.name ||
                        "Unknown User"}
                    </strong>{" "}
                    <span
                      style={{
                        opacity: 0.8,
                      }}
                    >
                      (
                      {activity.user
                        ?.role ||
                        "unknown"}
                      )
                    </span>
                  </p>

                  <p>
                    <strong>
                      Action:
                    </strong>{" "}
                    {activity.action}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {activity.description}
                  </p>

                  <p
                    style={{
                      marginBottom: 0,
                      opacity: 0.7,
                      fontSize: "13px",
                    }}
                  >
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BugDetails;
