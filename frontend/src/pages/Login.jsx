import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        
        // Redirect based on role
        const role = res.data.user.role;
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "faculty") {
          navigate("/faculty");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSent(false);

    try {
      const res = await API.post("/auth/forgot-password", { email: forgotEmail });
      if (res.data.success) {
        setForgotSent(true);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <motion.div 
            className="dashboard-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-center text-white mb-4 fw-bold">Sign In</h2>
            
            {error && (
              <div className="alert alert-danger bg-danger text-white border-0 py-2" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label form-label-custom">
                  <FiMail className="me-2 text-cyan" /> Email Address
                </label>
                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="name@jntugv.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label form-label-custom">
                  <FiLock className="me-2 text-cyan" /> Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-custom"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="text-end mb-3">
                <button
                  type="button"
                  className="btn btn-link p-0 text-cyan text-decoration-none small border-0"
                  style={{ color: "#06b6d4" }}
                  data-bs-toggle="modal"
                  data-bs-target="#forgotPasswordModal"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className="btn btn-premium-indigo w-100 py-3 mb-3 fw-bold"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>

            <div className="text-center text-secondary mt-3">
              Don't have an account?{" "}
              <Link to="/register" className="text-cyan text-decoration-none" style={{ color: "#06b6d4" }}>
                Sign Up
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <div className="modal fade" id="forgotPasswordModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-secondary text-white border-secondary">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Recover Password</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div className="modal-body">
                {forgotSent ? (
                  <div className="alert alert-success bg-success text-white border-0">
                    A password reset link has been dispatched to your email address.
                  </div>
                ) : (
                  <>
                    <p className="text-secondary small">Enter your email and we'll send a password recovery token link.</p>
                    {forgotError && <div className="alert alert-danger bg-danger text-white border-0 py-2">{forgotError}</div>}
                    <div className="mb-3">
                      <label className="form-label form-label-custom">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-control-custom"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-premium-outline" data-bs-dismiss="modal">Close</button>
                {!forgotSent && <button type="submit" className="btn btn-premium-indigo">Send Link</button>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
