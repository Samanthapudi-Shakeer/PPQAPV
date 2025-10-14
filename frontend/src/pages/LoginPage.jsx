import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:8000/api/auth/login`, { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/projects");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
   
          <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1a202c" }}>
            Project Plan
          </h1>
          <p style={{ color: "#718096", fontSize: "0.95rem" }}>
            TSIP QA PV
          </p>
        </div>

        {error && (
          <div className="error-message" data-testid="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="email-input"
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "#f7fafc", borderRadius: "12px" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "1rem", color: "#2d3748" }}>
            Try Demo Credentials:
          </h3>
          <div style={{ fontSize: "0.85rem", color: "#4a5568", lineHeight: "1.8" }}>
            <div><strong>Editor:</strong> editor@plankit.com / editor123</div>
            <div><strong>Viewer:</strong> viewer@plankit.com / viewer123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;