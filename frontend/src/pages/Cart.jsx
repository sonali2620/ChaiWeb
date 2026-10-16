import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Footer from "../components/Footer";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  MapPin,
  CreditCard,
  QrCode,
  Truck,
  Sparkles,
  ShieldCheck,
  Clock,
  Coffee,
  X
} from "lucide-react";
import { toast } from "react-toastify";

const Cart = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const {
    items,
    subtotal,
    discountAmount,
    taxAmount,
    deliveryFee,
    grandTotal,
    coupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart();

  // 4 Steps: 1 = Cart, 2 = Address, 3 = Payment, 4 = Confirmed
  const [step, setStep] = useState(1);
  const [couponInput, setCouponInput] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("default");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.mobileNo || "");
  const [addressStreet, setAddressStreet] = useState(user?.address || "");
  const [addressCity, setAddressCity] = useState("Pune");
  const [addressPincode, setAddressPincode] = useState("411001");
  const [addressLandmark, setAddressLandmark] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, UPI, CARD
  const [showUPIQR, setShowUPIQR] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const res = await API.get("/customer/profile");
          if (res.data?.data) {
            const cust = res.data.data;
            setCustomerName(cust.name || "");
            setCustomerPhone(cust.mobileNo || "");
            setAddressStreet(cust.address || "");
            if (cust.savedAddresses && cust.savedAddresses.length > 0) {
              setSavedAddresses(cust.savedAddresses);
              const defaultAddr = cust.savedAddresses.find((a) => a.isDefault) || cust.savedAddresses[0];
              if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
                setAddressStreet(defaultAddr.street);
                setAddressCity(defaultAddr.city || "Pune");
                setAddressPincode(defaultAddr.pincode);
                setAddressLandmark(defaultAddr.landmark || "");
              }
            }
          }
        } catch (e) {}
      };
      fetchProfile();
    }
  }, [token]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    await applyCoupon(couponInput.trim().toUpperCase());
    setLoadingCoupon(false);
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setAddressStreet(addr.street);
    setAddressCity(addr.city || "Pune");
    setAddressPincode(addr.pincode);
    setAddressLandmark(addr.landmark || "");
  };

  const handleProceedToAddress = () => {
    if (!token) {
      toast.info("Please login to complete your order ☕");
      navigate("/login?redirect=/cart");
      return;
    }
    setStep(2);
  };

  const handleProceedToPayment = () => {
    if (!customerName.trim() || !customerPhone.trim() || !addressStreet.trim() || !addressPincode.trim()) {
      toast.warning("Please fill in your name, mobile number, street address, and pincode");
      return;
    }
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: {
          street: addressStreet.trim(),
          city: addressCity.trim() || "Pune",
          pincode: addressPincode.trim(),
          landmark: addressLandmark.trim()
        },
        items: items.map((i) => ({
          productId: i.productId,
          productCustomId: i.productCustomId,
          productName: i.name,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl
        })),
        couponCode: coupon?.code || "",
        paymentMethod,
        specialInstructions: specialInstructions.trim()
      };

      const res = await API.post("/order/checkout", payload);

      if (res.data?.data) {
        const orderData = res.data.data;
        setPlacedOrderDetails(orderData);
        clearCart();
        setStep(4);
        toast.success("Order placed successfully! Brewing your fresh tea ☕");
      } else {
        toast.error(res.data?.error || "Failed to place order");
      }
    } catch (err) {
      console.error("Order Checkout Error:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="cart-page-wrapper min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      {/* 🧭 Top Checkout Header & Stepper */}
      <div className="bg-white border-bottom py-4 shadow-sm mb-4">
        <div className="container">
          <div className="stepper-container max-w-600 mx-auto" style={{ maxWidth: "650px" }}>
            <div className={`stepper-step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
              <div className="stepper-circle">
                {step > 1 ? <CheckCircle size={20} /> : "1"}
              </div>
              <span className="stepper-label">Cart Summary</span>
            </div>

            <div className={`stepper-step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
              <div className="stepper-circle">
                {step > 2 ? <CheckCircle size={20} /> : "2"}
              </div>
              <span className="stepper-label">Delivery Address</span>
            </div>

            <div className={`stepper-step ${step >= 3 ? "active" : ""} ${step > 3 ? "completed" : ""}`}>
              <div className="stepper-circle">
                {step > 3 ? <CheckCircle size={20} /> : "3"}
              </div>
              <span className="stepper-label">Payment</span>
            </div>

            <div className={`stepper-step ${step === 4 ? "active completed" : ""}`}>
              <div className="stepper-circle">
                {step === 4 ? <CheckCircle size={20} /> : "4"}
              </div>
              <span className="stepper-label">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container flex-grow-1 pb-5">
        {/* ========================================================
            STEP 1: SHOPPING CART LISTING & SUMMARY
           ======================================================== */}
        {step === 1 && (
          <div>
            {items.length === 0 ? (
              <div className="chai-card text-center p-5 max-w-600 mx-auto my-5" style={{ maxWidth: "550px" }}>
                <div className="mb-3" style={{ fontSize: "3.5rem" }}>☕</div>
                <h3 className="fw-bold mb-2">Your Chai Cart is Empty</h3>
                <p className="text-muted mb-4">
                  Looks like you haven't added your morning brew or crispy bun maska yet!
                </p>
                <Link to="/products" className="btn btn-chai-primary py-3 px-4">
                  <Coffee size={18} /> Explore Fresh Menu
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {/* Left: Cart Items List */}
                <div className="col-lg-8">
                  <div className="chai-card p-4 mb-4">
                    <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                      <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                        <ShoppingBag size={20} className="text-warning" />
                        My Order Items ({items.length})
                      </h5>
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-pill"
                        onClick={clearCart}
                        style={{ fontSize: "0.8rem" }}
                      >
                        <Trash2 size={14} /> Clear Cart
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light flex-wrap gap-3"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={item.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
                              alt={item.name}
                              style={{ width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover" }}
                            />
                            <div>
                              <h6 className="fw-bold mb-1">{item.name}</h6>
                              <span className="badge bg-white text-secondary border small">
                                ₹{item.price} each
                              </span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="d-flex align-items-center gap-4">
                            {/* Quantity */}
                            <div className="d-flex align-items-center border rounded-pill bg-white p-1">
                              <button
                                className="btn btn-sm btn-link p-0 text-dark text-decoration-none px-2"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2 fw-bold" style={{ minWidth: "20px", textAlign: "center" }}>
                                {item.quantity}
                              </span>
                              <button
                                className="btn btn-sm btn-link p-0 text-dark text-decoration-none px-2"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            {/* Item Subtotal */}
                            <h6 className="fw-bold mb-0 text-success" style={{ minWidth: "60px" }}>
                              ₹{item.price * item.quantity}
                            </h6>

                            {/* Delete */}
                            <button
                              className="btn btn-sm text-danger p-1"
                              onClick={() => removeFromCart(item.productId)}
                              title="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add More Items CTA */}
                  <div className="d-flex justify-content-between align-items-center p-3 bg-white border rounded-4">
                    <span className="text-muted small">Want to add hot snacks or extra cutting chai?</span>
                    <Link to="/products" className="btn btn-sm btn-chai-outline">
                      + Add More Items
                    </Link>
                  </div>
                </div>

                {/* Right: Bill Summary & Coupon */}
                <div className="col-lg-4">
                  <div className="chai-card p-4">
                    <h5 className="fw-bold mb-3">Bill Summary</h5>

                    {/* Promo Coupon Box */}
                    <div className="mb-4">
                      {coupon ? (
                        <div className="p-3 bg-success bg-opacity-10 border border-success rounded-3 d-flex align-items-center justify-content-between">
                          <div>
                            <span className="fw-bold text-success d-block">
                              🏷️ {coupon.code} Applied!
                            </span>
                            <span className="small text-muted">
                              You saved ₹{discountAmount} on this order
                            </span>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger py-1 px-2 rounded-circle"
                            onClick={removeCoupon}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control form-control-sm text-uppercase"
                            placeholder="Enter Promo Code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="btn btn-sm btn-chai-primary"
                            disabled={loadingCoupon || !couponInput.trim()}
                          >
                            Apply
                          </button>
                        </form>
                      )}
                      <div className="d-flex gap-2 mt-2">
                        <span
                          className="badge bg-light text-dark border small"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setCouponInput("CHAI10");
                            applyCoupon("CHAI10");
                          }}
                        >
                          CHAI10 (10% OFF)
                        </span>
                        <span
                          className="badge bg-light text-dark border small"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setCouponInput("WELCOME50");
                            applyCoupon("WELCOME50");
                          }}
                        >
                          WELCOME50 (₹50 OFF)
                        </span>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="d-flex flex-column gap-2 border-top pt-3" style={{ fontSize: "0.92rem" }}>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">Item Subtotal</span>
                        <span className="fw-bold">₹{subtotal}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="d-flex justify-content-between text-success">
                          <span>Coupon Discount</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">GST & Café Tax (5%)</span>
                        <span className="fw-bold">₹{taxAmount}</span>
                      </div>

                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">Delivery Fee</span>
                        <span>
                          {deliveryFee === 0 ? (
                            <span className="text-success fw-bold">FREE (Orders &gt; ₹200)</span>
                          ) : (
                            `₹${deliveryFee}`
                          )}
                        </span>
                      </div>

                      <hr className="my-2" />

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold d-block" style={{ fontSize: "1.1rem" }}>
                            Grand Total
                          </span>
                          <span className="text-muted small">Inclusive of all taxes</span>
                        </div>
                        <h4 className="fw-bold mb-0 text-success">₹{grandTotal}</h4>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      className="btn btn-chai-primary w-100 py-3 mt-4"
                      onClick={handleProceedToAddress}
                    >
                      Proceed to Delivery Address <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            STEP 2: DELIVERY ADDRESS & SPECIAL INSTRUCTIONS
           ======================================================== */}
        {step === 2 && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="chai-card p-4 mb-4">
                <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
                  <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <MapPin size={22} className="text-warning" /> Delivery Information
                  </h4>
                  <button className="btn btn-sm btn-link text-secondary text-decoration-none" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Back to Cart
                  </button>
                </div>

                {/* Saved Addresses Pill Selector */}
                {savedAddresses.length > 0 && (
                  <div className="mb-4">
                    <label className="fw-bold mb-2 small text-secondary">
                      Saved Addresses on your account:
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr._id}
                          type="button"
                          className={`btn btn-sm ${
                            selectedAddressId === addr._id ? "btn-chai-primary" : "btn-outline-secondary"
                          } rounded-pill px-3 py-2`}
                          onClick={() => handleSelectSavedAddress(addr)}
                        >
                          📍 {addr.label || "Home"}: {addr.street}, {addr.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Address Form */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Full Name *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Receiver's name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      className="form-control rounded-3"
                      placeholder="9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Street Address / Flat / Floor *</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="2"
                      placeholder="House/Flat No., Building Name, Street"
                      value={addressStreet}
                      onChange={(e) => setAddressStreet(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">City *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Pincode *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="411001"
                      value={addressPincode}
                      onChange={(e) => setAddressPincode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Nearby Landmark (Optional)</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="e.g. Opposite City Mall, Near Metro Station"
                      value={addressLandmark}
                      onChange={(e) => setAddressLandmark(e.target.value)}
                    />
                  </div>

                  {/* Special Chai Customization Note */}
                  <div className="col-12 mt-4">
                    <div className="p-3 bg-light rounded-3 border">
                      <label className="form-label fw-bold mb-1 small text-dark d-flex align-items-center gap-1">
                        ☕ Barista Instructions & Customization
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Less sugar, extra adrak, make it piping hot, leave at security door..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button className="btn btn-chai-primary px-4 py-2" onClick={handleProceedToPayment}>
                    Proceed to Payment (₹{grandTotal}) <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: PAYMENT METHOD SELECTION & VERIFICATION
           ======================================================== */}
        {step === 3 && (
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="chai-card p-4 mb-4">
                <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-4">
                  <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <CreditCard size={22} className="text-warning" /> Select Payment Option
                  </h4>
                  <button className="btn btn-sm btn-link text-secondary text-decoration-none" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back to Address
                  </button>
                </div>

                {/* Amount to pay */}
                <div className="p-3 bg-light rounded-4 mb-4 d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-muted small d-block">Amount Payable</span>
                    <h3 className="fw-bold mb-0 text-success">₹{grandTotal}</h3>
                  </div>
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
                    ☕ 15-Min Boiling Hot Delivery
                  </span>
                </div>

                {/* Payment Option Cards */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Option 1: Cash on Delivery */}
                  <div
                    className={`p-3 rounded-4 border ${
                      paymentMethod === "COD" ? "border-primary bg-warning bg-opacity-10" : "bg-white"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <Truck size={24} className="text-primary" />
                        <div>
                          <h6 className="fw-bold mb-0">Cash on Delivery (COD)</h6>
                          <span className="small text-muted">Pay by cash or scan QR with delivery agent</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentRadio"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                      />
                    </div>
                  </div>

                  {/* Option 2: UPI Instant Payment */}
                  <div
                    className={`p-3 rounded-4 border ${
                      paymentMethod === "UPI" ? "border-primary bg-warning bg-opacity-10" : "bg-white"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPaymentMethod("UPI")}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <QrCode size={24} className="text-success" />
                        <div>
                          <h6 className="fw-bold mb-0">UPI (GPay / PhonePe / Paytm / BHIM)</h6>
                          <span className="small text-muted">Instant payment via UPI QR code or app intent</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentRadio"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                      />
                    </div>

                    {paymentMethod === "UPI" && (
                      <div className="mt-3 pt-3 border-top text-center">
                        {/* 📱 Google Pay / Sonali Kotagond Card */}
                        <div
                          className="mx-auto p-4 rounded-4 shadow-sm text-center"
                          style={{
                            maxWidth: "340px",
                            background: "#F8FAFC",
                            border: "1.5px solid #E2E8F0"
                          }}
                        >
                          {/* Profile Header */}
                          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3B82F6, #10B981)",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "1.1rem"
                              }}
                            >
                              SK
                            </div>
                            <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.2rem" }}>
                              Sonali Kotagond
                            </h5>
                          </div>

                          {/* Scanner QR Box */}
                          <div
                            className="bg-white p-3 rounded-4 shadow-sm d-inline-block position-relative mb-3"
                            style={{ border: "1px solid #CBD5E1" }}
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi%3A%2F%2Fpay%3Fpa%3Dsonalikotagond29%40oksbi%26pn%3DSonali%20Kotagond%26am%3D${grandTotal}%26cu%3DINR`}
                              alt="Sonali Kotagond UPI Scanner"
                              style={{ width: "200px", height: "200px", display: "block" }}
                            />
                            {/* GPay Logo Badge Center Overlay */}
                            <div
                              className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle p-1 shadow-sm"
                              style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: "linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.75rem",
                                  fontWeight: 800
                                }}
                              >
                                GPay
                              </div>
                            </div>
                          </div>

                          {/* UPI ID & Amount */}
                          <div className="mb-2">
                            <span className="text-secondary small d-block mb-1">
                              UPI ID: <strong className="text-dark font-monospace">sonalikotagond29@oksbi</strong>
                            </span>
                            <span className="badge bg-success bg-opacity-15 text-success fw-bold fs-6 px-3 py-1 rounded-pill">
                              Pay ₹{grandTotal}
                            </span>
                          </div>

                          <p className="text-muted small mb-3">Scan to pay with any UPI app</p>

                          {/* Quick Mobile Intent / Copy Button */}
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary flex-fill rounded-pill"
                              onClick={() => {
                                navigator.clipboard.writeText("sonalikotagond29@oksbi");
                                toast.success("UPI ID copied: sonalikotagond29@oksbi 📋");
                              }}
                            >
                              📋 Copy UPI ID
                            </button>

                            <a
                              href={`upi://pay?pa=sonalikotagond29@oksbi&pn=Sonali%20Kotagond&am=${grandTotal}&cu=INR`}
                              className="btn btn-sm btn-primary flex-fill rounded-pill"
                            >
                              📱 Open UPI App
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 3: Online Card / NetBanking */}
                  <div
                    className={`p-3 rounded-4 border ${
                      paymentMethod === "CARD" ? "border-primary bg-warning bg-opacity-10" : "bg-white"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setPaymentMethod("CARD")}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <CreditCard size={24} className="text-secondary" />
                        <div>
                          <h6 className="fw-bold mb-0">Credit / Debit Card / NetBanking</h6>
                          <span className="small text-muted">Visa, Mastercard, RuPay & all major banks</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentRadio"
                        checked={paymentMethod === "CARD"}
                        onChange={() => setPaymentMethod("CARD")}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3 bg-light rounded-3 text-secondary small mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Delivering to:</span>
                    <strong className="text-dark">{addressStreet}, {addressCity}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Recipient:</span>
                    <strong className="text-dark">{customerName} ({customerPhone})</strong>
                  </div>
                </div>

                {/* Final Button */}
                <button
                  className="btn btn-chai-primary w-100 py-3 fw-bold"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                >
                  {placingOrder ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Confirming Order & Brewing...
                    </>
                  ) : (
                    <>
                      Confirm & Place Order (₹{grandTotal}) 🚀
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: ORDER CONFIRMATION & REAL-TIME SUCCESS
           ======================================================== */}
        {step === 4 && placedOrderDetails && (
          <div className="row justify-content-center">
            <div className="col-lg-7 text-center">
              <div className="chai-card p-5 mb-4">
                <div
                  className="mx-auto mb-3 rounded-circle shadow-sm"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--accent-green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <CheckCircle size={44} />
                </div>

                <h2 className="fw-bold text-success mb-2">Order Confirmed! ☕</h2>
                <p className="text-muted mb-4">
                  Your order <strong>#{placedOrderDetails._id.slice(-6).toUpperCase()}</strong> has been sent to our café kitchen. Our barista is freshly brewing your refreshments!
                </p>

                {/* Summary Box */}
                <div className="p-4 bg-light rounded-4 text-start mb-4">
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted">Order ID</span>
                    <strong className="font-monospace">{placedOrderDetails._id}</strong>
                  </div>

                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted">Total Paid</span>
                    <strong className="text-success">₹{placedOrderDetails.totalAmount} ({placedOrderDetails.paymentMethod})</strong>
                  </div>

                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span className="text-muted">Estimated Preparation & Delivery</span>
                    <strong>~{placedOrderDetails.estimatedMinutes || 25} Minutes</strong>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Delivery Address</span>
                    <span className="text-end" style={{ maxWidth: "250px" }}>
                      {placedOrderDetails.deliveryAddress?.fullAddress}
                    </span>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 justify-content-center">
                  <Link
                    to={`/orders/${placedOrderDetails._id}`}
                    className="btn btn-chai-primary py-3 px-4"
                  >
                    📦 Track Live Order Timeline
                  </Link>

                  <Link to="/products" className="btn btn-chai-secondary py-3 px-4">
                    Back to Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;