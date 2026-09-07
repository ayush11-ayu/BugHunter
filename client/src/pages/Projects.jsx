import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      console.log("Starting projects API request...");

      setLoading(true);
      setError("");

      const response = await api.get("/projects");

      console.log("Projects loaded:", response.data);

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Get projects error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>
      <h1>Projects</h1>

      <p>View and manage BugHunter projects.</p>

      <Link to="/bugs">
        <button>View Bugs</button>
      </Link>

      <hr />

      {loading && <p>Loading projects...</p>}

      {error && (
        <div>
          <p>
            <strong>Error:</strong> {error}
          </p>

          <button onClick={loadProjects}>Try Again</button>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <p>No projects found.</p>
      )}

      {!loading && !error && projects.length > 0 && (
        <div>
          <h2>Projects ({projects.length})</h2>

          {projects.map((project) => (
            <div
              key={project._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h2>{project.name}</h2>

              <p>{project.description}</p>

              <p>
                <strong>Status:</strong> {project.status}
              </p>

              {project.createdBy && (
                <p>
                  <strong>Created By:</strong> {project.createdBy.name}
                </p>
              )}

              <Link to="/bugs">
                <button>View Project Bugs</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;