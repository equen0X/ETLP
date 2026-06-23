import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FiBookOpen, FiUser, FiLogOut, FiSearch, FiAward, FiBell } from "react-icons/fi";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <FiBookOpen className="me-2" style={{ color: "#06b6d4" }} />
          <span>ETLP</span>
        </Link>
        
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/courses">Courses</Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/search">
                    <FiSearch className="me-1" /> Search
                  </Link>
                </li>
                {user.role === "student" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/progress">My Progress</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/certificates">
                        <FiAward className="me-1" /> Certificates
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <ul className="navbar-nav align-items-center">
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link className="btn btn-sm btn-outline-warning me-2" to="/admin">Admin Console</Link>
                  </li>
                )}
                {user.role === "faculty" && (
                  <li className="nav-item">
                    <Link className="btn btn-sm btn-outline-info me-2" to="/faculty">Faculty Portal</Link>
                  </li>
                )}
                {user.role === "student" && (
                  <li className="nav-item">
                    <Link className="btn btn-sm btn-outline-success me-2" to="/dashboard">My Learnings</Link>
                  </li>
                )}

                {/* Notifications Bell */}
                <li className="nav-item me-3">
                  <NotificationBell />
                </li>

                {/* Visible Profile Button */}
                <li className="nav-item d-flex align-items-center me-2">
                  <Link className="btn btn-sm btn-outline-light" to="/profile">Profile</Link>
                </li>

                {/* Profile Link (dropdown) */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center text-white cursor-pointer"
                    id="profileDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: 'none' }}
                  >
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="rounded-circle me-2"
                        width="32"
                        height="32"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                        <FiUser />
                      </div>
                    )}
                    <span>{user.name.split(" ")[0]}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-secondary bg-secondary" aria-labelledby="profileDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <FiUser className="me-2" /> My Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider border-secondary" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                        <FiLogOut className="me-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link className="btn btn-premium-outline" to="/login">Login</Link>
                <Link className="btn btn-premium-indigo" to="/register">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;