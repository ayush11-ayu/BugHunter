import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBug } from "../services/bugService";

function CreateBug() {
  const navigate = useNavigate();

  const initialFormData = {
    title: "",
    description: "",
    project: "",
    priority: "Low",
    severity: "Minor",
    environment: "",
    stepsToReproduce: "",
    expectedResult: "",
    actualResult: "",
    tags: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await createBug(formData);

      console.log("Bug created successfully:", result);

      setMessage("Bug created successfully!");

      setFormData(initialFormData);

      setTimeout(() => {
        navigate("/bugs");
      }, 1000);
    } catch (error) {
      console.error("Create bug error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create bug. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create New Bug</h1>

      <p>Report a new bug or issue in the application.</p>

      {message && (
        <div>
          <strong>{message}</strong>
          <p>Redirecting to Bugs...</p>
        </div>
      )}

      {error && (
        <div>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Bug Title</label>
          <br />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter bug title"
            required
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the bug"
            rows="5"
            cols="50"
            required
          />
        </div>

        <br />

        <div>
          <label>Project</label>
          <br />
          <select
            name="project"
            value={formData.project}
            onChange={handleChange}
            required
          >
            <option value="">Select Project</option>

            <option value="BugHunter Web Application">
              BugHunter Web Application
            </option>

            <option value="Mobile Application">
              Mobile Application
            </option>
          </select>
        </div>

        <br />

        <div>
          <label>Priority</label>
          <br />

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <br />

        <div>
          <label>Severity</label>
          <br />

          <select
            name="severity"
            value={formData.severity}
            onChange={handleChange}
          >
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Critical">Critical</option>
            <option value="Blocker">Blocker</option>
          </select>
        </div>

        <br />

        <div>
          <label>Environment</label>
          <br />

          <input
            type="text"
            name="environment"
            value={formData.environment}
            onChange={handleChange}
            placeholder="Example: Chrome, macOS, Production"
          />
        </div>

        <br />

        <div>
          <label>Steps to Reproduce</label>
          <br />

          <textarea
            name="stepsToReproduce"
            value={formData.stepsToReproduce}
            onChange={handleChange}
            placeholder={"1. Open login page\n2. Enter username\n3. Click Login"}
            rows="6"
            cols="50"
          />
        </div>

        <br />

        <div>
          <label>Expected Result</label>
          <br />

          <textarea
            name="expectedResult"
            value={formData.expectedResult}
            onChange={handleChange}
            placeholder="Describe what should happen"
            rows="4"
            cols="50"
          />
        </div>

        <br />

        <div>
          <label>Actual Result</label>
          <br />

          <textarea
            name="actualResult"
            value={formData.actualResult}
            onChange={handleChange}
            placeholder="Describe what actually happened"
            rows="4"
            cols="50"
          />
        </div>

        <br />

        <div>
        <label>Tags</label>
        <br />

        <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Example: login, authentication, UI"
        />
        </div>

        <br />

        <button type="submit" disabled={loading}>
        {loading ? "Creating Bug..." : "Create Bug"}
        </button>
    </form>
    </div>
);
}

export default CreateBug;