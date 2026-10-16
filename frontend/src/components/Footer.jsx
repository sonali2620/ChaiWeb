import { Link } from "react-router-dom";
import { Coffee, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer style={{ background: "var(--primary-darker)", color: "#E5DACE" }} className="pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand & Story */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: "var(--accent-amber)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.1rem"
                }}
              >
                ☕
              </div>
              <h4 className="text-white mb-0" style={{ fontFamily: "var(--font-heading)" }}>
                Chai Adda
              </h4>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#C5B6A8", lineHeight: 1.6 }}>
              Crafting authentic Indian chai experiences since inception. Freshly brewed with whole crushed spices, pure farm milk, and endless passion for every sip.
            </p>
            <div className="d-flex gap-3 text-warning">
              <span>⭐⭐⭐⭐⭐ 4.9/5 Rating (10,000+ Happy Sippers)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.88rem" }}>
              <li>
                <Link to="/" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Explore Menu
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  My Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Guest Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Menu Categories */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3">Top Categories</h6>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: "0.88rem" }}>
              <li>
                <Link to="/products?category=CHAI" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Masala & Kadak Chai
                </Link>
              </li>
              <li>
                <Link to="/products?category=CHAI" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Matka Kulhad Chai
                </Link>
              </li>
              <li>
                <Link to="/products?category=COFFEE" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Filter Coffee
                </Link>
              </li>
              <li>
                <Link to="/products?category=SNACKS" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Irani Bun Maska
                </Link>
              </li>
              <li>
                <Link to="/products?category=COMBOS" className="text-decoration-none" style={{ color: "#C5B6A8" }}>
                  Value Combos
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Info & Hours */}
          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-bold mb-3">Store & Delivery Hours</h6>
            <div className="d-flex flex-column gap-2" style={{ fontSize: "0.88rem", color: "#C5B6A8" }}>
              <div className="d-flex align-items-center gap-2">
                <Clock size={16} className="text-warning" />
                <span>Monday – Sunday: <strong>7:00 AM – 11:30 PM</strong></span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <MapPin size={16} className="text-warning" />
                <span>FC Road & Viman Nagar, Pune, Maharashtra</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-warning" />
                <span>+91 98765 43210 / 020-2567890</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-warning" />
                <span>support@chaiadda.com</span>
              </div>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.12)" }} />

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between pt-3 gap-2" style={{ fontSize: "0.82rem", color: "#9E8E81" }}>
          <div>
            © {new Date().getFullYear()} <strong>Chai Adda Pvt Ltd</strong>. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-1">
            Freshly brewed with <Heart size={14} className="text-danger fill-danger" /> for Chai lovers across India.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
