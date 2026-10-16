import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Coffee,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle,
  Tag
} from "lucide-react";
import { toast } from "react-toastify";

const Admin = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/admin/analytics");
      if (res.data?.data) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error("Admin analytics fetch error:", err);
      toast.error("Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <AdminNavbar />
        <div className="text-center py-5 my-auto">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-3 text-muted">Calculating real-time analytics from MongoDB...</p>
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const lowStock = analytics?.lowStockProducts || [];
  const statusDist = analytics?.statusDistribution || {};
  const revenueHistory = analytics?.revenueHistory || [];
  const topProducts = analytics?.topSellingProducts || [];
  const recentOrders = analytics?.recentOrders || [];

  return (
    <div className="admin-dashboard min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <div
        className="py-4 px-3 px-lg-4 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary-darker) 0%, #1A110B 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-1">
              👑 ADMIN MANAGEMENT PORTAL
            </span>
            <h3 className="fw-bold mb-0 text-white">Chai Adda Business Analytics</h3>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-light opacity-75">Live Database Feed</span>
            <button className="btn btn-sm btn-outline-light rounded-pill" onClick={fetchAnalytics}>
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      <AdminNavbar />

      <div className="container-fluid px-3 px-lg-4 pb-5 flex-grow-1">
        {/* ⚠️ Low Stock Alert Banner */}
        {lowStock.length > 0 && (
          <div className="alert alert-warning border-warning shadow-sm rounded-4 d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <AlertTriangle size={24} className="text-warning flex-shrink-0" />
              <div>
                <strong className="d-block">Low Inventory Stock Alert!</strong>
                <span className="small">
                  {lowStock.length} product(s) are at or below low stock threshold:{" "}
                  <strong>{lowStock.map((p) => `${p.p_name} (${p.stockQuantity} left)`).join(", ")}</strong>
                </span>
              </div>
            </div>
            <Link to="/admin/products" className="btn btn-sm btn-warning text-dark fw-bold rounded-pill">
              Manage Inventory Stock →
            </Link>
          </div>
        )}

        {/* 📊 1. KPI STATS CARDS */}
        <div className="row g-3 mb-4">
          {/* Total Revenue */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="kpi-card h-100">
              <div>
                <span className="text-muted small d-block mb-1">Total Revenue</span>
                <h4 className="fw-bold mb-0 text-success">₹{kpis.totalRevenue || 0}</h4>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--accent-green)" }}>
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* Today's Sales */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="kpi-card h-100">
              <div>
                <span className="text-muted small d-block mb-1">Today's Sales</span>
                <h4 className="fw-bold mb-0 text-primary">₹{kpis.todaySales || 0}</h4>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#2563EB" }}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="kpi-card h-100">
              <div>
                <span className="text-muted small d-block mb-1">Total Orders</span>
                <h4 className="fw-bold mb-0">{kpis.totalOrders || 0}</h4>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "rgba(217, 119, 6, 0.15)", color: "var(--accent-amber)" }}>
                <ShoppingBag size={24} />
              </div>
            </div>
          </div>

          {/* Pending Kitchen Orders */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="kpi-card h-100">
              <div>
                <span className="text-muted small d-block mb-1">Pending Kitchen</span>
                <h4 className="fw-bold mb-0 text-warning">{kpis.pendingOrders || 0}</h4>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#D97706" }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="kpi-card h-100">
              <div>
                <span className="text-muted small d-block mb-1">Total Customers</span>
                <h4 className="fw-bold mb-0">{kpis.totalCustomers || 0}</h4>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6" }}>
                <Users size={24} />
              </div>
            </div>
          </div>

          {/* Menu Catalog Items */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="kpi-card h-100">
              <div>
                <span className="text-muted small d-block mb-1">Menu Items</span>
                <h4 className="fw-bold mb-0">{kpis.totalProducts || 0}</h4>
              </div>
              <div className="kpi-icon-wrapper" style={{ background: "rgba(111, 78, 55, 0.15)", color: "var(--primary)" }}>
                <Coffee size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* 📈 2. VISUAL CHARTS & ANALYTICS ROW */}
        <div className="row g-4 mb-4">
          {/* Revenue Over Last 7 Days */}
          <div className="col-lg-8">
            <div className="chai-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Daily Revenue & Order Trends (Last 7 Days)</h5>
                <span className="badge bg-light text-secondary border small">Database Generated</span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr className="small text-muted">
                      <th>Date / Day</th>
                      <th>Orders Count</th>
                      <th>Revenue Bar</th>
                      <th className="text-end">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueHistory.map((day, idx) => {
                      const maxRev = Math.max(...revenueHistory.map((d) => d.revenue), 100);
                      const percent = Math.round((day.revenue / maxRev) * 100);

                      return (
                        <tr key={idx}>
                          <td className="fw-semibold small">{day.day}</td>
                          <td>
                            <span className="badge bg-light text-dark border">{day.orders} orders</span>
                          </td>
                          <td style={{ minWidth: "160px" }}>
                            <div className="progress" style={{ height: "10px", borderRadius: "5px" }}>
                              <div
                                className="progress-bar bg-warning"
                                role="progressbar"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="text-end fw-bold text-success">₹{day.revenue}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Orders by Status & Top Selling */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-4 h-100">
              {/* Order Status Breakdown */}
              <div className="chai-card p-4">
                <h5 className="fw-bold mb-3">Order Status Breakdown</h5>
                <div className="d-flex flex-column gap-2">
                  {Object.entries(statusDist).length === 0 ? (
                    <span className="text-muted small">No orders recorded yet.</span>
                  ) : (
                    Object.entries(statusDist).map(([status, count]) => (
                      <div key={status} className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                        <span className="small fw-semibold">{status}</span>
                        <span className="badge bg-primary rounded-pill">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="chai-card p-4 flex-grow-1">
                <h5 className="fw-bold mb-3">Top 5 Best Sellers</h5>
                <div className="d-flex flex-column gap-2">
                  {topProducts.length === 0 ? (
                    <span className="text-muted small">No sales data recorded yet.</span>
                  ) : (
                    topProducts.map((p, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between">
                        <span className="small fw-semibold text-truncate" style={{ maxWidth: "200px" }}>
                          #{idx + 1} {p.name}
                        </span>
                        <span className="badge bg-success bg-opacity-15 text-success small">
                          {p.count} sold
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📦 3. RECENT ORDERS STREAM */}
        <div className="chai-card p-4">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
            <div>
              <h5 className="fw-bold mb-0">Recent Order Activity</h5>
              <span className="text-muted small">Live incoming customer orders</span>
            </div>
            <Link to="/admin/orders" className="btn btn-sm btn-chai-primary">
              View All Orders →
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items Summary</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No customer orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td className="font-monospace small fw-bold">
                        #{ord._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <span className="fw-semibold d-block small">{ord.customerName}</span>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>{ord.customerEmail}</span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: "240px" }}>
                        {(ord.items || []).map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                      </td>
                      <td className="fw-bold text-success">₹{ord.totalAmount}</td>
                      <td>
                        <span className="badge bg-warning text-dark small">{ord.orderStatus}</span>
                      </td>
                      <td className="small text-muted">
                        {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="text-end">
                        <Link to="/admin/orders" className="btn btn-sm btn-outline-secondary py-1 px-2 rounded-pill">
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;