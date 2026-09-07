import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getBugById,
  updateBug,
} from "../services/bugService";
import api from "../services/api";
import {
  canAssignBugs,
  canChangeBugStatus,
} from "../utils/permissionUtils";

function BugDetails() {
  const { id } = useParams();

  const [bug, setBug] = useState(null);
  const [users, setUsers] = useState([]);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [severity, setSeverity] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canAssign = canAssignBugs();
  const canChangeStatus = canChangeBugStatus();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const requests = [getBugById(id)];

        if (canAssign) {
          requests.push(api.get("/users"));
        }

        const results = await Promise.all(requests);

        const bugResult = results[0];
        const usersResult = results[1];

        const loadedBug = bugResult.bug;

        setBug(loadedBug);

        if (usersResult) {
          setUsers(usersResult.data.users || []);
        }

        setStatus(loadedBug.status);
        setPriority(loadedBug.priority);
        setSeverity(loadedBug.severity);
        setAssignedTo(loadedBug.assignedTo || "");
      } catch (error) {
        console.error("Load bug details error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load bug details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, canAssign]);

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

      const result = await updateBug(id, updateData);

      setBug(result.bug);

      setStatus(result.bug.status);
      setPriority(result.bug.priority);
      setSeverity(result.bug.severity);
      setAssignedTo(result.bug.assignedTo || "");

      setMessage("Bug updated successfully!");
    } catch (error) {
      console.error("Update bug error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update bug. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading bug details...</p>;
  }

  if (error && !bug) {
    return (
      <div>
        <p>{error}</p>

        <Link to="/bugs">
          <button>Back to Bugs</button>
        </Link>
      </div>
    );
  }

  if (!bug) {
    return <p>Bug not found.</p>;
  }

  return (
    <div>
      <Link to="/bugs">
        <button>Back to Bugs</button>
      </Link>

      <hr />

      <h1>{bug.title}</h1>

      <p>
        <strong>Bug ID:</strong> {bug._id}
      </p>

      <p>
        <strong>Description:</strong>
      </p>

      <p>{bug.description}</p>

      <p>
        <strong>Project:</strong> {bug.project}
      </p>

      <hr />

      <h2>Update Bug</h2>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      {error && (
        <p>
          <strong>Error:</strong> {error}
        </p>
      )}

      <form onSubmit={handleUpdate}>
        <div>
          <label>
            <strong>Status:</strong>
          </label>

          <br />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={!canChangeStatus}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>

          {!canChangeStatus && (
            <p>
              <small>
                You do not have permission to change bug status.
              </small>
            </p>
          )}
        </div>

        <br />

        <div>
          <label>
            <strong>Priority:</strong>
          </label>

          <br />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <br />

        <div>
          <label>
            <strong>Severity:</strong>
          </label>

          <br />

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Critical">Critical</option>
            <option value="Blocker">Blocker</option>
          </select>
        </div>

        {canAssign && (
          <>
            <br />

            <div>
              <label>
                <strong>Assigned To:</strong>
              </label>

              <br />

              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              >
                <option value="">Unassigned</option>

                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <br />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <hr />

      <h2>Bug Information</h2>

      <p>
        <strong>Status:</strong> {bug.status}
      </p>

      <p>
        <strong>Priority:</strong> {bug.priority}
      </p>

      <p>
        <strong>Severity:</strong> {bug.severity}
      </p>

      <p>
        <strong>Assigned To:</strong>{" "}
        {bug.assignedTo
          ? users.find((user) => user._id === bug.assignedTo)?.name ||
            bug.assignedTo
          : "Unassigned"}
      </p>

      {bug.environment && (
        <div>
          <p>
            <strong>Environment:</strong>
          </p>

          <p>{bug.environment}</p>
        </div>
      )}

      {bug.stepsToReproduce && (
        <div>
          <p>
            <strong>Steps to Reproduce:</strong>
          </p>

          <pre>{bug.stepsToReproduce}</pre>
        </div>
      )}

      {bug.expectedResult && (
        <div>
          <p>
            <strong>Expected Result:</strong>
          </p>

          <p>{bug.expectedResult}</p>
        </div>
      )}

      {bug.actualResult && (
        <div>
          <p>
            <strong>Actual Result:</strong>
          </p>

          <p>{bug.actualResult}</p>
        </div>
      )}

      {bug.tags && bug.tags.length > 0 && (
        <div>
          <p>
            <strong>Tags:</strong>
          </p>

          <p>{bug.tags.join(", ")}</p>
        </div>
      )}

      <p>
        <strong>Created:</strong>{" "}
        {new Date(bug.createdAt).toLocaleString()}
      </p>

      <p>
        <strong>Last Updated:</strong>{" "}
        {new Date(bug.updatedAt).toLocaleString()}
      </p>
    </div>
);
}

export default BugDetails;