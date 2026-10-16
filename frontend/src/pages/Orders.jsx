import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Eye
} from "lucide-react";
import { toast } from "react-toastify";

const Orders = () => {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ACTIVE, COMPLETED

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await API.get("/order/my-orders");
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((it) => {
      addToCart({
        _id: it.productId,
        p_name: it.name,
        price: it.price,
        imageUrl: it.imageUrl
      }, it.quantity);
    });
    toast.success("All items added to your cart! ☕");
  };

  const filteredOrders = orders.filter((o) => {
    const isFinished = ["DELIVERED", "COMPLETED", "CANCELLED"].includes(o.orderStatus);
    if (activeTab === "ACTIVE") return !isFinished;
    if (activeTab === "COMPLETED") return isFinished;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ORDER PLACED":
      case "PLACED":
        return <span className="badge bg-primary">Order Received</span>;
      case "CONFIRMED":
        return <span className="badge bg-info text-dark">Confirmed</span>;
      case "PREPARING":
        return <span className="badge bg-warning text-dark">Brewing Fresh ☕</span>;
      case "READY":
        return <span className="badge bg-warning text-dark">Ready for Pickup</span>;
      case "OUT FOR DELIVERY":
        return <span className="badge bg-primary">Out for Delivery 🛵</span>;
      case "DELIVERED":
      case "COMPLETED":
        return <span className="badge bg-success">Delivered ✓</span>;
      case "CANCELLED":
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="orders-page min-vh-100 d-flex flex-column">
      <div className="bg-white border-bottom py-4 shadow-sm mb-4">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "var(--primary-darker)" }}>
                <Package size={26} className="text-warning" /> My Orders & History
              </h2>
              <p className="text-muted mb-0 small">
                Track live preparation progress and view your past Chai Adda receipts.
              </p>
            </div>

            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${activeTab === "ALL" ? "btn-chai-primary" : "btn-outline-secondary"} rounded-pill px-3`}
                onClick={() => setActiveTab("ALL")}
              >
                All Orders ({orders.length})
              </button>
              <button
                className={`btn btn-sm ${activeTab === "ACTIVE" ? "btn-chai-primary" : "btn-outline-secondary"} rounded-pill px-3`}
                onClick={() => setActiveTab("ACTIVE")}
              >
                Active Orders
              </button>
              <button
                className={`btn btn-sm ${activeTab === "COMPLETED" ? "btn-chai-primary" : "btn-outline-secondary"} rounded-pill px-3`}
                onClick={() => setActiveTab("COMPLETED")}
              >
                Past Receipts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex-grow-1 pb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="chai-card text-center p-5 max-w-600 mx-auto my-4" style={{ maxWidth: "550px" }}>
            <div className="mb-3" style={{ fontSize: "3rem" }}>📦</div>
            <h4 className="fw-bold">No orders found</h4>
            <p className="text-muted mb-4">You haven't placed any orders matching this filter yet.</p>
            <Link to="/products" className="btn btn-chai-primary">
              Order Fresh Chai Now ☕
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="chai-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-3 gap-2">
                  <div>
                    <span className="text-muted small">Order ID: </span>
                    <strong className="font-monospace">#{order._id.slice(-6).toUpperCase()}</strong>
                    <span className="mx-2 text-muted">•</span>
                    <span className="text-muted small">
                      {new Date(order.createdAt || order.orderDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {getStatusBadge(order.orderStatus)}
                    <span className="badge bg-light text-dark border">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="row g-3 mb-3">
                  {(order.items || []).map((it, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4">
                      <div className="p-2 border rounded-3 bg-light d-flex align-items-center gap-3">
                        <img
                          src={it.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
                          alt={it.name}
                          style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                        />
                        <div>
                          <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: "0.9rem", maxWidth: "160px" }}>
                            {it.name}
                          </h6>
                          <span className="text-muted small">
                            Qty: {it.quantity} × ₹{it.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center pt-3 border-top gap-3">
                  <div>
                    <span className="text-muted small d-block">Total Paid Amount:</span>
                    <h5 className="fw-bold mb-0 text-success">₹{order.totalAmount}</h5>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill"
                      onClick={() => handleReorder(order)}
                    >
                      <RefreshCw size={14} /> Reorder All Items
                    </button>

                    <Link
                      to={`/orders/${order._id}`}
                      className="btn btn-sm btn-chai-primary d-flex align-items-center gap-1 rounded-pill"
                    >
                      <Eye size={14} /> Live Order Tracking <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
