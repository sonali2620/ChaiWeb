import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { Star, MessageSquare, Send, CheckCircle, Coffee, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

const Feedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userName: user?.name || "",
    userEmail: user?.email || "",
    rating: 5,
    comment: "",
    productName: ""
  });

  const [hoverRating, setHoverRating] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      const [fRes, pRes] = await Promise.all([
        API.get("/feedback?envelope=true"),
        API.get("/products")
      ]);
      setFeedbacks(fRes.data?.data || (Array.isArray(fRes.data) ? fRes.data : []));
      setProducts(pRes.data?.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchFeedbacks();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userName: user.name || "",
        userEmail: user.email || ""
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userEmail || !formData.comment.trim()) {
      toast.warning("Please provide your email and comment");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/feedback", formData);
      if (res.data?.data) {
        toast.success("Thank you! Your review was shared successfully ⭐");
        setFormData({
          userName: user?.name || "",
          userEmail: user?.email || "",
          rating: 5,
          comment: "",
          productName: ""
        });
        fetchFeedbacks();
      } else {
        toast.error(res.data?.error || "Failed to submit feedback");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page-wrapper min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      {/* Header Banner */}
      <div
        className="py-5 text-center text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div className="container">
          <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-2">
            COMMUNITY LOVE & FEEDBACK
          </span>
          <h1 className="fw-bold mb-2 text-white">Rate Your Chai Adda Experience</h1>
          <p className="text-light opacity-75 max-w-600 mx-auto mb-0" style={{ maxWidth: "500px" }}>
            Every cup tells a story. Share your thoughts on our brews, service, and snacks!
          </p>
        </div>
      </div>

      <div className="container py-5 flex-grow-1">
        <div className="row g-4 justify-content-center">
          {/* Left Form */}
          <div className="col-lg-5">
            <div className="chai-card p-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--primary-darker)" }}>
                <MessageSquare size={22} className="text-warning" /> Write a Review
              </h4>

              <form onSubmit={handleSubmit}>
                {/* Star Rating selector */}
                <div className="mb-4 text-center p-3 bg-light rounded-4 border">
                  <label className="form-label fw-bold d-block mb-2 small text-secondary">
                    Your Rating: {hoverRating || formData.rating} / 5 Stars
                  </label>
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-link p-0 text-warning"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setFormData({ ...formData, rating: star })}
                      >
                        <Star
                          size={32}
                          fill={(hoverRating || formData.rating) >= star ? "#F59E0B" : "none"}
                          stroke="#F59E0B"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Your Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="yourname@gmail.com"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Item Reviewed (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  >
                    <option value="">General Café Experience ☕</option>
                    {products.map((p) => (
                      <option key={p._id || p.productId} value={p.p_name}>
                        {p.p_name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Review & Comments *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="What did you love about your chai, bun maska, or delivery speed?"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-chai-primary w-100 py-3"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit My Review ⭐"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Reviews Feed */}
          <div className="col-lg-7">
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: "var(--primary-darker)" }}>
              <Coffee size={22} className="text-warning" /> Recent Customer Experiences ({feedbacks.length})
            </h4>

            <div className="d-flex flex-column gap-3">
              {feedbacks.length === 0 ? (
                <div className="chai-card p-4 text-center text-muted">
                  No reviews submitted yet. Be the first to share your experience!
                </div>
              ) : (
                feedbacks.slice(0, 8).map((f) => (
                  <div key={f._id} className="chai-card p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: "var(--primary-tint)",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem"
                          }}
                        >
                          {(f.userName || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0" style={{ fontSize: "0.9rem" }}>
                            {f.userName || "Guest Sipper"}
                          </h6>
                          {f.productName && (
                            <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                              Reviewed: {f.productName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="d-flex text-warning">
                        {[...Array(f.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#F59E0B" />
                        ))}
                      </div>
                    </div>

                    <p className="small text-secondary mb-0" style={{ lineHeight: 1.5 }}>
                      "{f.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;