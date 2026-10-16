import { useEffect, useState } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  Coffee,
  X,
  MapPin,
  Phone,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/order/admin/all", {
        params: {
          status: selectedStatus,
          search: searchQuery
        }
      });
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/order/${orderId}/status`, { status: newStatus });
      if (res.data?.data) {
        toast.success(`Order #${orderId.slice(-6).toUpperCase()} status changed to ${newStatus} ✅`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;

    try {
      await API.delete(`/order/${orderId}`);
      toast.success("Order deleted successfully");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrderDetails?._id === orderId) {
        setSelectedOrderDetails(null);
      }
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const statusOptions = [
    "ORDER PLACED",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT FOR DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ];

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchId = o._id.toLowerCase().includes(q);
    const matchEmail = (o.customerEmail || "").toLowerCase().includes(q);
    const matchName = (o.customerName || "").toLowerCase().includes(q);
    const matchPhone = (o.customerPhone || "").toLowerCase().includes(q);
    return matchId || matchEmail || matchName || matchPhone;
  });

  return (
    <div className="admin-orders-page min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
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
            <h3 className="fw-bold mb-0 text-white">📦 Customer Orders Management</h3>
            <p className="text-light opacity-75 small mb-0">
              Live order tracking, status progression, and customer fulfillment
            </p>
          </div>
          <button className="btn btn-sm btn-outline-light rounded-pill" onClick={fetchOrders}>
            🔄 Refresh Orders
          </button>
        </div>
      </div>

      <AdminNavbar />

      <div className="container-fluid px-3 px-lg-4 pb-5 flex-grow-1">
        {/* Search & Status Filter Controls */}
        <div className="chai-card p-3 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-5">
              <div className="position-relative">
                <Search size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
                <input
                  type="text"
                  className="form-control ps-5 py-2 rounded-pill bg-light border-0"
                  placeholder="Search by Order ID, Customer Name, Email, Mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-7 d-flex gap-2 overflow-x-auto pb-1">
              {["ALL", ...statusOptions].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${
                    selectedStatus === st ? "btn-chai-primary" : "btn-light border"
                  } rounded-pill px-3`}
                  style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}
                  onClick={() => setSelectedStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="chai-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Items Details</th>
                  <th>Total Amount</th>
                  <th>Status Progress</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="spinner-border text-warning" role="status"></div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      No orders found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-monospace small fw-bold">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <strong className="d-block small">{order.customerName || "Customer"}</strong>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {order.customerEmail}
                        </span>
                        {order.customerPhone && (
                          <span className="d-block text-muted" style={{ fontSize: "0.72rem" }}>
                            📞 {order.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="small" style={{ maxWidth: "220px" }}>
                        {(order.items || []).map((it, idx) => (
                          <div key={idx} className="text-truncate">
                            • {it.name} (x{it.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="fw-bold text-success">₹{order.totalAmount}</td>
                      <td>
                        <select
                          className="form-select form-select-sm fw-bold border-warning bg-light"
                          style={{ fontSize: "0.8rem", width: "170px" }}
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {order.paymentMethod}
                        </span>
                        <span className={`badge ms-1 small ${order.paymentStatus === "COMPLETED" ? "bg-success" : "bg-warning text-dark"}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(order.createdAt || order.orderDate).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-icon"
                            onClick={() => setSelectedOrderDetails(order)}
                            title="View Full Order Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-icon text-danger"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🔍 Order Details Modal */}
      {selectedOrderDetails && (
        <div className="modal-backdrop-custom" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-content-custom p-4" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0">
                Order #{selectedOrderDetails._id.slice(-6).toUpperCase()} Details
              </h5>
              <button className="btn-icon" onClick={() => setSelectedOrderDetails(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="p-3 bg-light rounded-3 mb-3 small">
              <h6 className="fw-bold mb-2">Customer & Destination:</h6>
              <div className="d-flex justify-content-between mb-1">
                <span>Name:</span>
                <strong>{selectedOrderDetails.customerName}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Email:</span>
                <span>{selectedOrderDetails.customerEmail}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Mobile:</span>
                <span>{selectedOrderDetails.customerPhone || "N/A"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Address:</span>
                <span className="text-end" style={{ maxWidth: "260px" }}>
                  {selectedOrderDetails.deliveryAddress?.fullAddress}
                </span>
              </div>
            </div>

            {/* Items */}
            <h6 className="fw-bold mb-2 small">Ordered Items:</h6>
            <div className="d-flex flex-column gap-2 mb-3">
              {(selectedOrderDetails.items || []).map((it, idx) => (
                <div key={idx} className="p-2 border rounded-3 bg-white d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={it.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
                      alt={it.name}
                      style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                    />
                    <div>
                      <strong className="d-block small">{it.name}</strong>
                      <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Qty: {it.quantity} × ₹{it.price}
                      </span>
                    </div>
                  </div>
                  <strong className="small text-success">₹{it.price * it.quantity}</strong>
                </div>
              ))}
            </div>

            {/* Customization note */}
            {selectedOrderDetails.specialInstructions && (
              <div className="p-2 bg-warning bg-opacity-10 border rounded mb-3 small">
                <strong>Barista Note:</strong> "{selectedOrderDetails.specialInstructions}"
              </div>
            )}

            {/* Total */}
            <div className="d-flex justify-content-between border-top pt-3 fw-bold">
              <span>Grand Total:</span>
              <span className="text-success fs-5">₹{selectedOrderDetails.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;