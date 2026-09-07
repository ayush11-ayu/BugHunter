import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      console.log("Starting users API request...");

      setLoading(true);
      setError("");

      const response = await api.get("/users");

      console.log("Users loaded:", response.data);

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Get users error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Users page loaded");
    loadUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>

      <p>View BugHunter users and their roles.</p>

      <Link to="/bugs">
        <button>View Bugs</button>
      </Link>

      <hr />

      {loading && <p>Loading users...</p>}

      {error && (
        <div>
          <p>
            <strong>Error:</strong> {error}
          </p>

          <button onClick={loadUsers}>Try Again</button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <p>No users found.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div>
          <h2>System Users ({users.length})</h2>

          {users.map((user) => (
            <div
              key={user._id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >
              <h3>{user.name}</h3>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>

              <p>
                <strong>User ID:</strong> {user._id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;