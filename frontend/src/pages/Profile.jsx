import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiShield, FiUpload, FiCheckCircle } from "react-icons/fi";
import API from "../services/api";

function Profile() {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const res = await API.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setMessage("Profile updated successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-4" style={{ maxWidth: 800 }}>
      <motion.div 
        className="dashboard-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-white mb-4 fw-bold text-center text-md-start">Profile Management</h2>
        <hr className="border-secondary mb-4" />

        {message && <div className="alert alert-success bg-success text-white border-0">{message}</div>}
        {error && <div className="alert alert-danger bg-danger text-white border-0">{error}</div>}

        <form onSubmit={handleSubmit} className="row g-4">
          {/* Avatar column */}
          <div className="col-md-4 text-center">
            <div className="position-relative d-inline-block">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="rounded-circle border border-secondary"
                  style={{ width: 150, height: 150, objectFit: "cover" }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-secondary border border-secondary d-flex align-items-center justify-content-center text-white mx-auto"
                  style={{ width: 150, height: 150, fontSize: "3rem" }}
                >
                  {name ? name.charAt(0).toUpperCase() : <FiUser />}
                </div>
              )}
              <label 
                htmlFor="avatarInput" 
                className="btn btn-sm btn-dark position-absolute bottom-0 end-0 rounded-circle p-2 d-flex align-items-center justify-content-center border-secondary"
                style={{ width: 36, height: 36, cursor: "pointer" }}
              >
                <FiUpload size={16} />
              </label>
              <input 
                type="file" 
                id="avatarInput" 
                className="d-none" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <div className="text-muted small mt-2">Click upload icon to change image</div>
          </div>

          {/* Form details column */}
          <div className="col-md-8">
            <div className="mb-3">
              <label className="form-label form-label-custom">
                <FiUser className="me-2 text-cyan" /> Full Name
              </label>
              <input 
                type="text" 
                className="form-control form-control-custom"
                value={name}
                onChange={e => setName(e.target.value)}
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
                value={user?.email}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label form-label-custom">
                <FiShield className="me-2 text-cyan" /> User Role
              </label>
              <input 
                type="text" 
                className="form-control form-control-custom text-capitalize"
                value={user?.role}
                disabled
              />
            </div>

            <div className="mb-4 d-flex align-items-center gap-2">
              <FiCheckCircle size={18} className={user?.verified ? "text-success" : "text-warning"} />
              <span className={user?.verified ? "text-success fw-bold" : "text-warning fw-bold"}>
                {user?.verified ? "Email Verified" : "Verification Pending"}
              </span>
            </div>

            <button 
              type="submit" 
              className="btn btn-premium-indigo w-100 py-3"
              disabled={loading}
            >
              {loading ? "Saving changes..." : "Save Profile"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger w-100 py-3 mt-2"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Profile;