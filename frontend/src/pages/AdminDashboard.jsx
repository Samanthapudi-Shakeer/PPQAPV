import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  PlusCircle,
  Search,
  Trash2,
  XCircle
} from "lucide-react";

const USER_COLUMNS = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "created_at", label: "Created At" }
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "viewer"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState({ key: "username", direction: "asc" });
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(`${API}/users`, formData);
      setSuccess("User created successfully!");
      setShowModal(false);
      setFormData({ email: "", username: "", password: "", role: "viewer" });
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API}/users/${userId}`);
      setSuccess("User deleted successfully!");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleUserSort = (columnKey) => {
    setUserSort((current) => {
      if (current.key === columnKey) {
        return {
          key: columnKey,
          direction: current.direction === "asc" ? "desc" : "asc"
        };
      }

      return { key: columnKey, direction: "asc" };
    });
  };

  const userTableData = useMemo(() => {
    const searchLower = userSearch.trim().toLowerCase();

    const filtered = users.filter((user) => {
      if (!searchLower) return true;

      return USER_COLUMNS.some((column) => {
        if (column.key === "created_at") {
          const dateText = new Date(user.created_at).toLocaleDateString();
          return dateText.toLowerCase().includes(searchLower);
        }

        const value = user[column.key];
        if (value === null || value === undefined) {
          return false;
        }

        return String(value).toLowerCase().includes(searchLower);
      });
    });

    const { key, direction } = userSort;
    if (!key) {
      return filtered;
    }

    const multiplier = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "created_at") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue === null || aValue === undefined) return 1 * multiplier;
      if (bValue === null || bValue === undefined) return -1 * multiplier;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * multiplier;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (aString < bString) return -1 * multiplier;
      if (aString > bString) return 1 * multiplier;
      return 0;
    });
  }, [userSearch, userSort, users]);

  return (
    <div className="page-container">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#718096" }}>
              Welcome, {currentUser.username}
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-outline" onClick={() => navigate("/projects")} data-testid="view-projects-btn">
              View Projects
            </button>
            <button className="btn btn-danger" onClick={handleLogout} data-testid="logout-btn">
              Logout
            </button>
          </div>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>User Management</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <div className="search-box" style={{ flex: "1", minWidth: "240px" }}>
                <Search aria-hidden="true" className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  data-testid="user-table-search"
                />
              </div>
              <button
                className="btn btn-primary btn-icon"
                onClick={() => setShowModal(true)}
                data-testid="add-user-btn"
                aria-label="Add User"
              >
                <PlusCircle size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {USER_COLUMNS.map((column) => {
                      const isSorted = userSort.key === column.key;
                      const SortIcon = !isSorted
                        ? ArrowUpDown
                        : userSort.direction === "asc"
                        ? ArrowUpAZ
                        : ArrowDownAZ;

                      return (
                        <th key={column.key}>
                          <button
                            type="button"
                            className="table-sort-button"
                            onClick={() => handleUserSort(column.key)}
                            aria-label={`Sort by ${column.label}`}
                          >
                            <span>{column.label}</span>
                            <SortIcon aria-hidden="true" size={16} />
                          </button>
                        </th>
                      );
                    })}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userTableData.length === 0 ? (
                    <tr>
                      <td colSpan={USER_COLUMNS.length + 1} style={{ textAlign: "center", padding: "2rem", color: "#4a5568" }}>
                        {users.length === 0
                          ? "No users available yet."
                          : "No users match the current filters."}
                      </td>
                    </tr>
                  ) : (
                    userTableData.map((user) => (
                      <tr key={user.id}>
                        {USER_COLUMNS.map((column) => {
                          let content = user[column.key];

                          if (column.key === "role") {
                            content = (
                              <span className={`badge badge-${user.role}`}>
                                {user.role}
                              </span>
                            );
                          }

                          if (column.key === "created_at") {
                            content = new Date(user.created_at).toLocaleDateString();
                          }

                          return (
                            <td key={column.key} data-label={column.label}>
                              {content}
                            </td>
                          );
                        })}
                        <td data-label="Actions">
                          {user.id !== currentUser.id && (
                            <button
                              className="btn btn-danger btn-icon"
                              onClick={() => handleDeleteUser(user.id)}
                              data-testid={`delete-user-${user.id}`}
                              aria-label={`Delete ${user.username}`}
                            >
                              <Trash2 size={18} aria-hidden="true" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New User</h2>
                <button className="close-btn" onClick={() => setShowModal(false)} aria-label="Close">
                  <XCircle size={18} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="new-user-email"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Username</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    data-testid="new-user-username"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    data-testid="new-user-password"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Role</label>
                  <select
                    className="input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    data-testid="new-user-role"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} data-testid="submit-new-user">
                    Create User
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;