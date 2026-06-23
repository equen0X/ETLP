import { useState, useEffect, useContext } from "react";
import { FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications");
        if (res.data.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.notifications.filter(n => !n.is_read).length);
        }
      } catch (error) {
        console.error("Fetch notifications error:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20 seconds
    return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await API.put(`/notifications/read/${n.id}`);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark notifications read error:", error);
    }
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-link text-white position-relative p-0 border-0"
        type="button"
        id="bellDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        onClick={markAllAsRead}
      >
        <FiBell size={20} className="text-secondary" style={{ hover: { color: "#06b6d4" } }} />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
            {unreadCount}
          </span>
        )}
      </button>

      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-secondary bg-secondary p-2" aria-labelledby="bellDropdown" style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
        <li className="d-flex justify-content-between align-items-center mb-2 px-2">
          <h6 className="m-0 fw-bold">Notifications</h6>
          <Link to="/notifications" className="text-decoration-none text-cyan" style={{ fontSize: "0.8rem", color: "#06b6d4" }}>
            View All
          </Link>
        </li>
        <li><hr className="dropdown-divider border-secondary" /></li>
        {notifications.length === 0 ? (
          <li className="text-center text-muted py-3" style={{ fontSize: "0.85rem" }}>
            No notifications yet
          </li>
        ) : (
          notifications.slice(0, 5).map(n => (
            <li key={n.id} className="py-2 px-2 border-bottom border-secondary" style={{ opacity: n.is_read ? 0.7 : 1 }}>
              <p className="m-0 text-white" style={{ fontSize: "0.85rem" }}>{n.message}</p>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                {new Date(n.created_at).toLocaleDateString()}
              </small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotificationBell;