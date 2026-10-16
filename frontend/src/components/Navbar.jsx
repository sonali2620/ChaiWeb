import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../services/api";
import {
  Coffee,
  ShoppingBag,
  Heart,
  Bell,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  CheckCircle,
  Package,
  Sparkles
} from "lucide-react";

const Navbar = () => {
  const { user, token, isAdmin, logout, favorites } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (token) {
      const fetchNotifs = async () => {
        try {
          const res = await API.get("/notifications");
          if (res.data?.data) {
            setNotifications(res.data.data.notifications || []);
            setUnreadCount(res.data.data.unreadCount || 0);
          }
        } catch (e) {}
      };
      fetchNotifs();
    }
  }, [token, location.pathname]);

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="chai-navbar py-2 px-3 px-lg-4">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* ☕ Brand Logo */}
        <Link to="/" className="nav-brand-logo">
          <div className="logo-icon">☕</div>
          <div>
            <span style={{ color: "var(--primary)" }}>Chai</span>
            <span style={{ color: "var(--accent-amber)" }}> Adda</span>
            <span style={{ fontSize: "0.65rem", display: "block", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.08em" }}>
              CRAFT CHAI & CAFÉ
            </span>
          </div>
        </Link>

        {/* 🌐 Desktop Nav Links */}
        <nav className="d-none d-lg-flex align-items-center gap-1">
          <Link to="/" className={`nav-link-custom ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/products" className={`nav-link-custom ${isActive("/products") ? "active" : ""}`}>
            Menu & Order ☕
          </Link>
          <Link to="/feedback" className={`nav-link-custom ${isActive("/feedback") ? "active" : ""}`}>
            Feedback
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link-custom ${location.pathname.startsWith("/admin") ? "active text-warning fw-bold" : ""}`}
              style={{ color: "#B45309" }}
            >
              <Shield size={16} className="me-1 inline-block" /> Admin Portal
            </Link>
          )}
        </nav>

        {/* 🛍️ Actions & Controls */}
        <div className="d-flex align-items-center gap-2">
          {/* Wishlist */}
          <Link
            to="/favorites"
            className="btn-icon position-relative"
            title="My Wishlist"
          >
            <Heart size={19} className={favorites.length > 0 ? "text-danger fill-danger" : ""} />
            {favorites.length > 0 && (
              <span className="badge-count" style={{ background: "#EF4444" }}>
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="btn-chai-primary py-2 px-3 position-relative"
            style={{ fontSize: "0.9rem" }}
          >
            <ShoppingBag size={18} />
            <span className="d-none d-sm-inline">Cart</span>
            {totalItemsCount > 0 && (
              <span className="badge-count" style={{ top: "-6px", right: "-6px" }}>
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* Notifications Dropdown */}
          {token && (
            <div className="position-relative" ref={notifRef}>
              <button
                className="btn-icon position-relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                title="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="badge-count">{unreadCount}</span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className="dropdown-menu show shadow-lg p-0 position-absolute end-0 mt-2"
                  style={{ width: "320px", borderRadius: "14px", border: "1px solid var(--border-light)", zIndex: 1050 }}
                >
                  <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light rounded-top">
                    <h6 className="mb-0 fw-bold">🔔 Notifications</h6>
                    {unreadCount > 0 && (
                      <button
                        className="btn btn-sm btn-link p-0 text-decoration-none"
                        onClick={markAllRead}
                        style={{ fontSize: "0.75rem", color: "var(--primary)" }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted" style={{ fontSize: "0.85rem" }}>
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 border-bottom ${!n.isRead ? "bg-warning bg-opacity-10" : ""}`}
                          style={{ fontSize: "0.85rem" }}
                        >
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold" style={{ color: "var(--primary)" }}>{n.title}</span>
                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mb-1 text-secondary mt-1">{n.message}</p>
                          {n.link && (
                            <Link
                              to={n.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="fw-bold"
                              style={{ color: "var(--accent-amber)", fontSize: "0.8rem" }}
                            >
                              View details →
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {token ? (
            <div className="position-relative" ref={userRef}>
              <button
                className="btn-icon d-flex align-items-center gap-1 px-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ width: "auto", borderRadius: "20px", background: "var(--primary-tint)" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700
                  }}
                >
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-md-inline fw-semibold text-truncate ms-1" style={{ maxWidth: "100px", fontSize: "0.85rem" }}>
                  {user?.name || "My Account"}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  className="dropdown-menu show shadow-lg p-2 position-absolute end-0 mt-2"
                  style={{ minWidth: "220px", borderRadius: "14px", border: "1px solid var(--border-light)" }}
                >
                  <div className="px-3 py-2 border-bottom">
                    <p className="mb-0 fw-bold">{user?.name || "Customer"}</p>
                    <p className="mb-0 text-muted text-truncate" style={{ fontSize: "0.75rem" }}>
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <span className="badge bg-warning text-dark mt-1" style={{ fontSize: "0.68rem" }}>
                        👑 ADMIN
                      </span>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item py-2 d-flex align-items-center gap-2 rounded"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={16} /> My Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="dropdown-item py-2 d-flex align-items-center gap-2 rounded"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Package size={16} /> My Orders & Tracking
                  </Link>

                  <Link
                    to="/favorites"
                    className="dropdown-item py-2 d-flex align-items-center gap-2 rounded"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Heart size={16} /> Saved Favorites
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item py-2 d-flex align-items-center gap-2 rounded text-warning fw-bold"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield size={16} /> Admin Management
                    </Link>
                  )}

                  <hr className="my-1" />

                  <button
                    className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger rounded"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn-chai-outline py-2 px-3" style={{ fontSize: "0.88rem" }}>
                Login
              </Link>
              <Link to="/register" className="btn-chai-primary py-2 px-3 d-none d-sm-inline-flex" style={{ fontSize: "0.88rem" }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="btn-icon d-lg-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="d-lg-none bg-white p-3 border-top mt-2 rounded shadow-sm">
          <div className="d-flex flex-column gap-2">
            <Link
              to="/"
              className={`nav-link-custom ${isActive("/") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ☕ Home
            </Link>
            <Link
              to="/products"
              className={`nav-link-custom ${isActive("/products") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              📜 Explore Menu & Order
            </Link>
            <Link
              to="/feedback"
              className={`nav-link-custom ${isActive("/feedback") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⭐ Customer Reviews
            </Link>

            {token ? (
              <>
                <Link
                  to="/orders"
                  className="nav-link-custom"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📦 My Orders & Tracking
                </Link>
                <Link
                  to="/profile"
                  className="nav-link-custom"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 My Profile & Addresses
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="nav-link-custom text-warning fw-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👑 Admin Dashboard
                  </Link>
                )}
                <button
                  className="btn btn-outline-danger btn-sm text-start mt-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2 mt-2">
                <Link
                  to="/login"
                  className="btn-chai-outline flex-fill text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-chai-primary flex-fill text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
