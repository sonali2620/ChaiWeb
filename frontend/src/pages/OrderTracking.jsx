import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import Footer from "../components/Footer";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  Flame,
  Coffee,
  ArrowLeft,
  Printer,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    try {
      const res = await API.get(`/order/${orderId}`);
      if (res.data?.data) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error("Order tracking fetch error:", err);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // Poll for status update every 15 seconds
    const interval = setInterval(fetchOrderDetails, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const timelineSteps = [
    { key: "ORDER PLACED", label: "Order Received", desc: "Sent to café kitchen", icon: <Package size={16} /> },
    { key: "CONFIRMED", label: "Confirmed", desc: "Barista accepted order", icon: <CheckCircle size={16} /> },
    { key: "PREPARING", label: "Brewing Fresh", desc: "Crushing adrak & boiling tea", icon: <Flame size={16} /> },
    { key: "READY", label: "Packed & Ready", desc: "Sealed in thermal flasks", icon: <Coffee size={16} /> },
    { key: "OUT FOR DELIVERY", label: "Out For Delivery", desc: "Rider is heading your way", icon: <Truck size={16} /> },
    { key: "DELIVERED", label: "Delivered", desc: "Enjoy your hot Chai Adda sips!", icon: <ShieldCheck size={16} /> }
  ];

  const getStepIndex = (currentStatus) => {
    if (currentStatus === "COMPLETED") return 5;
    if (currentStatus === "CANCELLED") return -1;
    const index = timelineSteps.findIndex((s) => s.key === currentStatus);
    return index > -1 ? index : 0;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-5 min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-3 text-muted">Locating your chai order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center min-vh-100">
        <AlertCircle size={48} className="text-danger mb-3" />
        <h3>Order Not Found</h3>
        <p className="text-muted">The order ID could not be located in our system.</p>
        <Link to="/orders" className="btn btn-chai-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="order-tracking-page min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      {/* Top Header */}
      <div className="bg-white border-bottom py-3 shadow-sm mb-4">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/orders" className="btn btn-sm btn-link text-secondary text-decoration-none d-flex align-items-center gap-1">
            <ArrowLeft size={16} /> Back to Orders
          </Link>

          <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill" onClick={handlePrint}>
            <Printer size={14} /> Print Receipt
          </button>
        </div>
      </div>

      <div className="container flex-grow-1 pb-5">
        <div className="row g-4">
          {/* Left Column: Live Progress & Timeline */}
          <div className="col-lg-8">
            {/* Live Status Card */}
            <div className="chai-card p-4 mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-2">
                <div>
                  <span className="badge bg-warning bg-opacity-25 text-dark fw-bold px-3 py-1 rounded-pill mb-1">
                    LIVE TRACKING
                  </span>
                  <h4 className="fw-bold mb-0">Order #{order._id.slice(-6).toUpperCase()}</h4>
                </div>

                <div className="text-md-end">
                  <span className="small text-muted d-block">Estimated Preparation Time:</span>
                  <h5 className="fw-bold text-success mb-0">
                    ⏱️ ~{order.estimatedMinutes || 20} Mins
                  </h5>
                </div>
              </div>

              {/* Status Banner */}
              {order.orderStatus === "CANCELLED" ? (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} />
                  <span>This order was cancelled by the store.</span>
                </div>
              ) : (
                <div className="p-3 bg-light rounded-4 mb-4 d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "var(--accent-amber)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Coffee size={24} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ color: "var(--primary-darker)" }}>
                      Current Status: {order.orderStatus}
                    </h6>
                    <span className="small text-muted">
                      Your refreshments are being freshly crafted per order.
                    </span>
                  </div>
                </div>
              )}

              {/* 📋 Visual Timeline */}
              <div className="timeline-container ps-2">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = currentStepIdx > idx;
                  const isActive = currentStepIdx === idx;

                  return (
                    <div
                      key={step.key}
                      className={`timeline-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                    >
                      <div className="timeline-icon-box">
                        {isCompleted ? <CheckCircle size={18} /> : step.icon}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="fw-bold mb-0" style={{ color: isActive ? "var(--primary)" : "var(--text-main)" }}>
                            {step.label}
                          </h6>
                          {isActive && (
                            <span className="badge bg-warning text-dark small" style={{ fontSize: "0.7rem" }}>
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <p className="text-muted small mb-0 mt-1">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="chai-card p-3 bg-light border-0">
                <h6 className="fw-bold mb-1 small text-secondary">☕ Customization Note to Café:</h6>
                <p className="mb-0 small fst-italic">"{order.specialInstructions}"</p>
              </div>
            )}
          </div>

          {/* Right Column: Order Items & Delivery Summary */}
          <div className="col-lg-4">
            <div className="chai-card p-4 mb-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">Order Summary</h5>

              {/* Items List */}
              <div className="d-flex flex-column gap-3 mb-3">
                {(order.items || []).map((it, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={it.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
                        alt={it.name}
                        style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }}
                      />
                      <div>
                        <span className="fw-bold d-block small">{it.name}</span>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Qty: {it.quantity} × ₹{it.price}
                        </span>
                      </div>
                    </div>
                    <span className="fw-bold small text-success">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="border-top pt-3 d-flex flex-column gap-1 small">
                <div className="d-flex justify-content-between text-muted">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal || order.totalAmount}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <span>Coupon ({order.couponCode})</span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between text-muted">
                  <span>GST & Tax</span>
                  <span>₹{order.taxAmount || 0}</span>
                </div>
                <div className="d-flex justify-content-between text-muted">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between fw-bold fs-6">
                  <span>Total</span>
                  <span className="text-success">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery Details Card */}
            <div className="chai-card p-4">
              <h6 className="fw-bold mb-3 border-bottom pb-2">📍 Delivery Address</h6>
              <p className="small mb-2 fw-semibold">{order.customerName}</p>
              <p className="small text-muted mb-2">{order.deliveryAddress?.fullAddress}</p>
              <p className="small text-muted mb-0">📞 Contact: {order.customerPhone}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTracking;
