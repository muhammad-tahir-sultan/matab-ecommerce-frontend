import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/style.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Input Validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    if (username.length > 30) {
      setError("Username cannot exceed 30 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ username, email, password });

      if (result.success) {
        if (result.requiresVerification) {
          navigate("/verify-email", { state: { email: result.email } });
        } else {
          // Fallback for cases where verification isn't required (legacy or admin)
          navigate("/");
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Registration failed. Please try again.", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Create Account</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="auth-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <small style={{ color: "#666", fontSize: "12px", marginTop: "4px", display: "block" }}>
              Letters, numbers, and underscores only
            </small>
          </div>

          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
