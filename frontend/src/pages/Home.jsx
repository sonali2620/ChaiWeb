import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import Footer from "../components/Footer";
import {
  Coffee,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Star,
  Tag,
  Check,
  Award,
  Truck,
  Users
} from "lucide-react";
import { toast } from "react-toastify";

const Home = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, testRes] = await Promise.all([
          API.get("/products"),
          API.get("/feedback/testimonials")
        ]);

        const allProducts = prodRes.data?.data || (Array.isArray(prodRes.data) ? prodRes.data : []);
        const bs = allProducts.filter((p) => p.isBestseller);
        setBestsellers(bs.length > 0 ? bs.slice(0, 6) : allProducts.slice(0, 6));

        const sp = allProducts.filter((p) => p.isSpecial || p.category === "COMBOS" || p.category === "SPECIALS");
        setSpecials(sp.length > 0 ? sp.slice(0, 4) : allProducts.slice(2, 6));

        if (testRes.data?.data) {
          setTestimonials(testRes.data.data);
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      }
    };

    fetchData();
  }, []);

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code "${code}" copied to clipboard! 🎟️`);
    setTimeout(() => setCopiedCoupon(""), 2500);
  };

  const categories = [
    { name: "Chai", tag: "CHAI", icon: "☕", count: "8 Varieties", img: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500" },
    { name: "Filter Coffee", tag: "COFFEE", icon: "☕", count: "4 Blends", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500" },
    { name: "Hot Snacks", tag: "SNACKS", icon: "🍔", count: "6 Fresh Items", img: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500" },
    { name: "Value Combos", tag: "COMBOS", icon: "🍱", count: "Save up to ₹25", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500" },
    { name: "Chef Specials", tag: "SPECIALS", icon: "👑", count: "Royal Kahwa & more", img: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500" }
  ];

  return (
    <div className="home-page">
      {/* 🌟 1. HERO SECTION */}
      <section className="hero-wrapper">
        <div className="container">
          <div className="row align-items-center g-5">
            {/* Left Copy */}
            <div className="col-lg-6">
              <div className="hero-pill">
                <Sparkles size={16} className="text-warning" />
                <span>Pune's Favorite Artisanal Chai Destination</span>
              </div>

              <h1 className="hero-title">
                Your Perfect Chai, <br />
                <span>One Click Away.</span>
              </h1>

              <p className="hero-subtitle">
                Slow-brewed kadak Assam tea infused with freshly crushed ginger, green cardamom, and rich spices. Delivered piping hot to your doorstep in 15–20 mins.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/products" className="btn-chai-primary py-3 px-4" style={{ fontSize: "1rem" }}>
                  <Coffee size={20} /> Order Fresh Chai
                </Link>
                <Link to="/products" className="btn-chai-secondary py-3 px-4" style={{ fontSize: "1rem" }}>
                  Explore Menu <ArrowRight size={18} />
                </Link>
              </div>

              {/* Highlights Checklist */}
              <div className="d-flex flex-wrap gap-4 pt-3 border-top border-light">
                <div className="d-flex align-items-center gap-2 small fw-semibold text-secondary">
                  <Check size={16} className="text-success" /> 100% Desi Milk
                </div>
                <div className="d-flex align-items-center gap-2 small fw-semibold text-secondary">
                  <Check size={16} className="text-success" /> Zero Preservatives
                </div>
                <div className="d-flex align-items-center gap-2 small fw-semibold text-secondary">
                  <Check size={16} className="text-success" /> 15-Min Fast Delivery
                </div>
              </div>
            </div>

            {/* Right Hero Image with Floating Badges */}
            <div className="col-lg-6 text-center">
              <div className="hero-img-box">
                <img
                  src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80"
                  alt="Authentic Kulhad Chai"
                  className="hero-main-img"
                />

                {/* Floating Rating Badge */}
                <div className="floating-stat-badge badge-left">
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #F59E0B, #D97706)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}
                  >
                    <Star size={22} fill="white" />
                  </div>
                  <div className="text-start">
                    <h6 className="mb-0 fw-bold">4.9 ★ Rated</h6>
                    <span className="text-muted small">Over 10,000+ Orders</span>
                  </div>
                </div>

                {/* Floating Speed Badge */}
                <div className="floating-stat-badge badge-right">
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}
                  >
                    <Truck size={22} />
                  </div>
                  <div className="text-start">
                    <h6 className="mb-0 fw-bold">15-Min Delivery</h6>
                    <span className="text-muted small">Boiling Hot Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🏷️ 2. PROMOTIONAL COUPON STRIP */}
      <section className="py-3" style={{ background: "linear-gradient(90deg, #6F4E37 0%, #4A3324 100%)", color: "white" }}>
        <div className="container">
          <div className="row align-items-center g-3 text-center text-md-start">
            <div className="col-md-5 d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <Tag size={20} className="text-warning" />
              <div>
                <span className="fw-bold">Exclusive Café Discounts!</span>
                <span className="d-block small text-light opacity-75">Click code to copy and apply at checkout</span>
              </div>
            </div>

            <div className="col-md-7 d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                onClick={() => copyCoupon("CHAI10")}
              >
                <strong>CHAI10</strong> • 10% OFF {copiedCoupon === "CHAI10" && <Check size={14} className="text-success" />}
              </button>

              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                onClick={() => copyCoupon("WELCOME50")}
              >
                <strong>WELCOME50</strong> • Flat ₹50 OFF {copiedCoupon === "WELCOME50" && <Check size={14} className="text-success" />}
              </button>

              <button
                className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                onClick={() => copyCoupon("TEATIME")}
              >
                <strong>TEATIME</strong> • 15% OFF {copiedCoupon === "TEATIME" && <Check size={14} className="text-dark" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ☕ 3. EXPLORE CATEGORIES */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-warning bg-opacity-25 text-dark px-3 py-2 rounded-pill fw-bold mb-2">
              OUR SPECIALTIES
            </span>
            <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
              Explore By Category
            </h2>
            <p className="text-muted">Handcrafted beverages and crisp café snacks prepared fresh per order.</p>
          </div>

          <div className="row g-4">
            {categories.map((cat, idx) => (
              <div key={idx} className="col-6 col-md-4 col-lg">
                <Link
                  to={`/products?category=${cat.tag}`}
                  className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 text-decoration-none text-dark d-flex flex-column text-center position-relative group-hover"
                  style={{ background: "#FFFFFF", border: "1px solid var(--border-light)" }}
                >
                  <div style={{ height: "130px", overflow: "hidden" }}>
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-100 h-100 object-fit-cover"
                      style={{ transition: "transform 0.4s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </div>
                  <div className="p-3">
                    <h6 className="fw-bold mb-1">{cat.name}</h6>
                    <span className="small text-muted">{cat.count}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ 4. BESTSELLERS SHOWCASE */}
      <section className="py-5" style={{ background: "#FAF5EE" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4">
            <div>
              <span className="badge badge-bestseller px-3 py-2 rounded-pill mb-2">
                CUSTOMER FAVORITES
              </span>
              <h2 className="fw-bold mb-0" style={{ color: "var(--primary-darker)" }}>
                Most Loved Bestsellers ☕
              </h2>
            </div>
            <Link to="/products" className="btn-chai-outline mt-3 mt-md-0">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {bestsellers.length > 0 ? (
              bestsellers.map((prod) => (
                <div key={prod._id || prod.productId} className="col-12 col-md-6 col-lg-4">
                  <ProductCard product={prod} onQuickView={(p) => setSelectedProduct(p)} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4 text-muted">
                Loading freshest bestsellers...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🔥 5. TODAY'S SPECIAL COMBOS & OFFERS */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge badge-special px-3 py-2 rounded-pill mb-2">
              CHEF'S PICKS
            </span>
            <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
              Today's Special Combos & Pairings
            </h2>
            <p className="text-muted">Specially paired with crispy bun maska and spicy street appetizers.</p>
          </div>

          <div className="row g-4">
            {specials.length > 0 ? (
              specials.map((prod) => (
                <div key={prod._id || prod.productId} className="col-12 col-md-6 col-lg-3">
                  <ProductCard product={prod} onQuickView={(p) => setSelectedProduct(p)} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-4 text-muted">
                Loading chef's specials...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🛡️ 6. WHY CHOOSE CHAI ADDA */}
      <section className="py-5" style={{ background: "var(--primary-tint)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
              Why Chai Lovers Choose Chai Adda
            </h2>
            <p className="text-muted">We take our brews seriously. Here is what sets our tapri & café apart.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="chai-card p-4 h-100 text-center">
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(217, 119, 6, 0.15)",
                    color: "var(--accent-amber)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Flame size={28} />
                </div>
                <h5 className="fw-bold mb-2">Fresh Spices & Brew</h5>
                <p className="small text-muted mb-0">
                  Every batch is hand-crushed using fresh ginger roots, green cardamom pods, and premium Assam estate tea.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="chai-card p-4 h-100 text-center">
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--accent-green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Clock size={28} />
                </div>
                <h5 className="fw-bold mb-2">15-Min Boiling Hot Delivery</h5>
                <p className="small text-muted mb-0">
                  Special thermal-insulated flasks ensure your tea arrives sizzling hot, just like straight off the kettle.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="chai-card p-4 h-100 text-center">
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <HeartHandshake size={28} />
                </div>
                <h5 className="fw-bold mb-2">Customized As You Like</h5>
                <p className="small text-muted mb-0">
                  Tell our barista your preference: less sugar, extra adrak, strong kadak boil, or black tea without milk.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="chai-card p-4 h-100 text-center">
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(111, 78, 55, 0.15)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <ShieldCheck size={28} />
                </div>
                <h5 className="fw-bold mb-2">100% Hygienic Kitchen</h5>
                <p className="small text-muted mb-0">
                  Strict food safety standards, sanitized prep stations, and earthen clay kulhads for purity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 7. HOW IT WORKS */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-secondary bg-opacity-25 text-dark px-3 py-2 rounded-pill mb-2">
              SIMPLE & FAST
            </span>
            <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
              How To Get Your Chai Fix in 4 Steps
            </h2>
          </div>

          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3">
                <div
                  className="mx-auto mb-3 rounded-circle shadow-sm"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700
                  }}
                >
                  1
                </div>
                <h6 className="fw-bold">Pick Your Chai</h6>
                <p className="small text-muted">Choose from Masala, Kulhad, Kahwa, or Filter Coffee.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3">
                <div
                  className="mx-auto mb-3 rounded-circle shadow-sm"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "var(--accent-amber)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700
                  }}
                >
                  2
                </div>
                <h6 className="fw-bold">Add Warm Snacks</h6>
                <p className="small text-muted">Pair with buttered Irani Bun Maska or Samosa Pav.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3">
                <div
                  className="mx-auto mb-3 rounded-circle shadow-sm"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "var(--accent-orange)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700
                  }}
                >
                  3
                </div>
                <h6 className="fw-bold">Fast Checkout</h6>
                <p className="small text-muted">Apply coupons, choose UPI QR or Cash on Delivery.</p>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3">
                <div
                  className="mx-auto mb-3 rounded-circle shadow-sm"
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "var(--accent-green)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700
                  }}
                >
                  4
                </div>
                <h6 className="fw-bold">Sip & Enjoy</h6>
                <p className="small text-muted">Delivered fresh in minutes to your desk or living room.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💬 8. CUSTOMER REVIEWS & TESTIMONIALS */}
      <section className="py-5" style={{ background: "#F5EFE6" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill mb-2 fw-bold">
              VERIFIED GUESTS
            </span>
            <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
              What Our Chai Lovers Say
            </h2>
            <p className="text-muted">Real reviews from our daily regulars and tea connoisseurs.</p>
          </div>

          <div className="row g-4">
            {testimonials.length > 0 ? (
              testimonials.map((testi, idx) => (
                <div key={testi._id || idx} className="col-md-4">
                  <div className="chai-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex text-warning mb-2">
                        {[...Array(testi.rating || 5)].map((_, i) => (
                          <Star key={i} size={16} fill="#F59E0B" />
                        ))}
                      </div>
                      <p className="fst-italic text-secondary mb-3" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>
                        "{testi.comment}"
                      </p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                      <div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                          {testi.userName || "Happy Guest"}
                        </h6>
                        <span className="text-muted small">Verified Chai Adda Regular</span>
                      </div>
                      <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: "0.72rem" }}>
                        ✓ Verified Order
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-3 text-muted">
                No reviews yet. Be the first to share your experience on our Feedback page!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🚀 9. FINAL CTA BANNER */}
      <section className="py-5">
        <div className="container">
          <div
            className="p-5 rounded-4 text-center text-white position-relative overflow-hidden shadow-lg"
            style={{
              background: "linear-gradient(135deg, #4A3324 0%, #2E1F16 100%)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}
          >
            <h2 className="fw-bold text-white mb-3">Ready for your morning or evening Chai? ☕</h2>
            <p className="text-light opacity-75 max-w-600 mx-auto mb-4" style={{ maxWidth: "540px" }}>
              Explore our full menu, apply exclusive coupons, and get your fresh brew delivered in under 20 minutes!
            </p>
            <Link to="/products" className="btn btn-warning btn-lg fw-bold px-5 py-3 rounded-pill text-dark">
              Order Your Chai Now 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* Modal for product quick view */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;