import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBugs, searchBugs } from "../services/bugService";

function Bugs() {
  const [bugs, setBugs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBugs = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getBugs({
        status,
        priority,
        severity,
      });

      console.log("Bugs loaded:", result);
      setBugs(result.bugs || []);
    } catch (error) {
      console.error("Get bugs error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load bugs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const searchTerm = search.trim();

    if (!searchTerm) {
      loadBugs();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await searchBugs(searchTerm);

      console.log("Search results:", result);
      setBugs(result.bugs || []);
    } catch (error) {
      console.error("Search bugs error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to search bugs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setSeverity("");

    setTimeout(() => {
      loadBugs();
    }, 0);
  };

  useEffect(() => {
    loadBugs();
  }, []);

  return (
    <div>
      <h1>Bug Management</h1>

      <p>View and manage all reported bugs.</p>

      <Link to="/bugs/create">
        <button>Create New Bug</button>
      </Link>

      <hr />

      <h2>Search and Filter Bugs</h2>

      <div>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search bugs..."
        />

        {" "}

        <button onClick={handleSearch}>Search</button>
    </div>

    <br />

    <div>
        <label>
        <strong>Status: </strong>
        </label>

        <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        >
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
        <option value="Reopened">Reopened</option>
        </select>

        {"   "}

        <label>
        <strong>Priority: </strong>
        </label>

        <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        {"   "}

        <label>
          <strong>Severity: </strong>
        </label>

        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
        >
          <option value="">All Severities</option>
          <option value="Minor">Minor</option>
          <option value="Major">Major</option>
          <option value="Critical">Critical</option>
          <option value="Blocker">Blocker</option>
        </select>

        {"   "}

        <button onClick={loadBugs}>Apply Filters</button>

        {" "}

        <button onClick={handleClear}>Clear</button>
      </div>

      <hr />

      {loading && <p>Loading bugs...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && bugs.length === 0 && (
        <p>No bugs found.</p>
      )}

      {!loading && !error && bugs.length > 0 && (
        <div>
          <h2>
            {search.trim()
              ? `Search Results (${bugs.length})`
              : `Bug Results (${bugs.length})`}
          </h2>

          {bugs.map((bug) => (
            <div
              key={bug._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>
                <Link to={`/bugs/${bug._id}`}>
                  {bug.title}
                </Link>
              </h3>

              <p>{bug.description}</p>

              <p>
                <strong>Project:</strong> {bug.project}
              </p>

            <p>
                <strong>Status:</strong> {bug.status}
            </p>

            <p>
                <strong>Priority:</strong> {bug.priority}
              </p>

              <p>
                <strong>Severity:</strong> {bug.severity}
              </p>

              {bug.environment && (
                <p>
                  <strong>Environment:</strong> {bug.environment}
                </p>
              )}

              {bug.tags && bug.tags.length > 0 && (
                <p>
                  <strong>Tags:</strong> {bug.tags.join(", ")}
                </p>
              )}

              <small>
                Created: {new Date(bug.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bugs;

