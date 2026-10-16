import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { User, Mail, Lock, Phone, MapPin, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNo: "",
    address: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, mobileNo, address } = formData;

    if (!name || !email || !password || !mobileNo || !address) {
      toast.warning("Please fill in all registration fields");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/customer/register", formData);
      const data = res.data;

      if (data.status === "error" || data.error) {
        toast.error(data.error || "Registration failed");
      } else {
        toast.success("Account created successfully! Please login. ☕");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{
        background: "radial-gradient(circle at top right, rgba(245, 230, 202, 0.4), #FBF7F2 80%)"
      }}
    >
      <div className="chai-card p-4 p-md-5 shadow-lg border-0" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--accent-amber) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              color: "white",
              boxShadow: "0 8px 20px rgba(111, 78, 55, 0.25)"
            }}
          >
            ☕
          </div>
          <h3 className="fw-bold mb-1" style={{ color: "var(--primary-darker)" }}>
            Join Chai Adda
          </h3>
          <p className="text-muted small mb-0">Create your free account for instant ordering & offers</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold small text-secondary">Full Name</label>
            <div className="position-relative">
              <User size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <input
                type="text"
                name="name"
                className="form-control ps-5 py-2 rounded-3"
                placeholder="Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold small text-secondary">Email Address</label>
            <div className="position-relative">
              <Mail size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <input
                type="email"
                name="email"
                className="form-control ps-5 py-2 rounded-3"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold small text-secondary">Password</label>
            <div className="position-relative">
              <Lock size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <input
                type="password"
                name="password"
                className="form-control ps-5 py-2 rounded-3"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Mobile No */}
          <div className="mb-3">
            <label className="form-label fw-semibold small text-secondary">Mobile Number</label>
            <div className="position-relative">
              <Phone size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <input
                type="tel"
                name="mobileNo"
                className="form-control ps-5 py-2 rounded-3"
                placeholder="9876543210"
                value={formData.mobileNo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="form-label fw-semibold small text-secondary">Delivery Address</label>
            <div className="position-relative">
              <MapPin size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <textarea
                name="address"
                className="form-control ps-5 py-2 rounded-3"
                rows="2"
                placeholder="Flat / Building, Street, Pune - 411001"
                value={formData.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-chai-primary w-100 py-3 mb-3 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Profile...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center small text-muted mb-0">
          Already have an account?{" "}
          <Link to="/login" className="fw-bold" style={{ color: "var(--accent-amber)" }}>
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
