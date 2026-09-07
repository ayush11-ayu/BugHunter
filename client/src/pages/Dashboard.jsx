import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getDashboardSummary,
  getBugStatusStats,
  getBugPriorityStats,
  getProjectHealth,
} from "../services/dashboardService";

import { getCurrentUser } from "../utils/authUtils";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [statusStats, setStatusStats] = useState([]);
  const [priorityStats, setPriorityStats] = useState([]);
  const [projectHealth, setProjectHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = getCurrentUser();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResponse,
          statusResponse,
          priorityResponse,
          projectHealthResponse,
        ] = await Promise.all([
          getDashboardSummary(),
          getBugStatusStats(),
          getBugPriorityStats(),
          getProjectHealth(),
        ]);

        setSummary(summaryResponse.summary || null);

        // Backend returns: { success: true, stats: [...] }
        setStatusStats(statusResponse.stats || []);

        // Backend returns: { success: true, stats: [...] }
        setPriorityStats(priorityResponse.stats || []);

        // Backend returns: { success: true, projects: [...] }
        setProjectHealth(projectHealthResponse.projects || []);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>BugHunter Dashboard</h1>

      <p>
        Welcome, <strong>{user?.name || "User"}</strong>
      </p>

      <p>
        Role: <strong>{user?.role || "Unknown"}</strong>
      </p>

      <button
        onClick={handleLogout}
        style={{
          padding: "9px 16px",
          border: "none",
          borderRadius: "7px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {loading && (
        <p style={{ marginTop: "30px" }}>
          Loading dashboard...
        </p>
      )}

      {error && (
        <p
          style={{
            color: "#dc2626",
            marginTop: "30px",
          }}
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {/* Bug Overview */}

          <section style={{ marginTop: "30px" }}>
            <h2>Bug Overview</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <h3>Total Bugs</h3>
                <p>{summary?.totalBugs ?? 0}</p>
              </div>

              <div>
                <h3>Open Bugs</h3>
                <p>{summary?.openBugs ?? 0}</p>
              </div>

              <div>
                <h3>In Progress</h3>
                <p>{summary?.inProgressBugs ?? 0}</p>
              </div>

              <div>
                <h3>Resolved</h3>
                <p>{summary?.resolvedBugs ?? 0}</p>
              </div>

              <div>
                <h3>Closed</h3>
                <p>{summary?.closedBugs ?? 0}</p>
              </div>

              <div>
                <h3>Reopened</h3>
                <p>{summary?.reopenedBugs ?? 0}</p>
              </div>

              <div>
                <h3>Total Projects</h3>
                <p>{summary?.totalProjects ?? 0}</p>
              </div>
            </div>
          </section>

          {/* Bug Status Chart */}

          <section style={{ marginTop: "40px" }}>
            <h2>Bug Status</h2>

            {statusStats.length === 0 && (
              <p>No bug status data available.</p>
            )}

            {statusStats.length > 0 && (
              <div
                style={{
                  width: "100%",
                  height: 300,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={statusStats}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="_id" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Bug Priority Chart */}

          <section style={{ marginTop: "40px" }}>
            <h2>Bug Priority</h2>

            {priorityStats.length === 0 && (
              <p>No bug priority data available.</p>
            )}

            {priorityStats.length > 0 && (
              <div
                style={{
                  width: "100%",
                  height: 300,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart data={priorityStats}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="_id" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar dataKey="count" />
                </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Project Health */}

          <section style={{ marginTop: "40px" }}>
            <h2>Project Health</h2>

            {projectHealth.length === 0 && (
              <p>No project health data available.</p>
            )}

            {projectHealth.map((project) => (
              <div
                key={project._id}
                style={{
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                }}
              >
                <h3>{project._id}</h3>

                <p>
                  Total Bugs:{" "}
                  <strong>{project.totalBugs}</strong>
                </p>

                <p>
                  Open Bugs:{" "}
                  <strong>{project.openBugs}</strong>
                </p>

                <p>
                  In Progress:{" "}
                  <strong>{project.inProgressBugs}</strong>
                </p>

                <p>
                  Resolved:{" "}
                  <strong>{project.resolvedBugs}</strong>
                </p>

                <p>
                  Critical Bugs:{" "}
                <strong>{project.criticalBugs}</strong>
                </p>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;