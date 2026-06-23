import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiBriefcase } from "react-icons/fi";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/auth/register", formData);
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
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
            <h2 className="text-center text-white mb-4 fw-bold">Create Account</h2>
            
            {error && (
              <div className="alert alert-danger bg-danger text-white border-0 py-2" role="alert">
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success bg-success text-white border-0 py-2" role="alert">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label form-label-custom">
                  <FiUser className="me-2 text-cyan" /> Full Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-custom"
                  placeholder="e.g. Shabira"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label form-label-custom">
                  <FiMail className="me-2 text-cyan" /> Email Address
                </label>
                <input
                  type="email"
                  className="form-control form-control-custom"
                  placeholder="name@jntugv.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label form-label-custom">
                  <FiBriefcase className="me-2 text-cyan" /> Select Role
                </label>
                <select
                  className="form-select form-control-custom"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-premium-indigo w-100 py-3 mb-3 fw-bold"
                disabled={loading}
              >
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </form>

            <div className="text-center text-secondary mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan text-decoration-none" style={{ color: "#06b6d4" }}>
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Register;
