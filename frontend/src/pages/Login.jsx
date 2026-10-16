import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Coffee, Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warning("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/user/login", {
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      const data = res.data;
      if (data.status === "error") {
        toast.error(data.error || "Invalid credentials");
        return;
      }

      const { token, user } = data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name || "Chai Lover"}! ☕`);

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.error || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@chaiadda.com");
    setPassword("admin123");
  };

  return (
    <div
      className="login-page min-vh-100 d-flex align-items-center justify-content-center px-3 py-5"
      style={{
        background: "radial-gradient(circle at top right, rgba(245, 230, 202, 0.4), #FBF7F2 80%)"
      }}
    >
      <div className="chai-card p-4 p-md-5 shadow-lg border-0" style={{ maxWidth: "440px", width: "100%" }}>
        {/* Logo & Title */}
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
            Welcome to Chai Adda
          </h3>
          <p className="text-muted small mb-0">Sign in to order your favorite chai & snacks</p>
        </div>

        {/* Demo Credentials Quick-Filler */}
        <div className="p-3 bg-light rounded-3 border mb-4 text-center">
          <span className="small text-muted d-block mb-1">Testing Demo Credentials:</span>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning text-dark fw-bold rounded-pill px-3 py-1"
            style={{ fontSize: "0.78rem" }}
            onClick={fillDemoAdmin}
          >
            👑 Autofill Admin Account (admin@chaiadda.com)
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold small text-secondary">Email Address</label>
            <div className="position-relative">
              <Mail size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <input
                type="email"
                className="form-control ps-5 py-2 rounded-3"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label fw-semibold small text-secondary mb-0">Password</label>
            </div>
            <div className="position-relative">
              <Lock size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control ps-5 pe-5 py-2 rounded-3"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0 me-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                Brewing Login...
              </>
            ) : (
              <>
                Sign In to Chai Adda <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center small text-muted mb-0">
          Don't have an account yet?{" "}
          <Link to="/register" className="fw-bold" style={{ color: "var(--accent-amber)" }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;