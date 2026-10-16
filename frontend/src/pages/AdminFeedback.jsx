import { useEffect, useState } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import { Star, MessageSquare, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/feedback?envelope=true");
      setFeedbacks(res.data?.data || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to remove this feedback?")) return;
    try {
      await API.delete(`/feedback/${id}`);
      toast.success("Feedback removed");
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      toast.error("Failed to delete feedback");
    }
  };

  return (
    <div className="admin-feedback min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      <div
        className="py-4 px-3 px-lg-4 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary-darker) 0%, #1A110B 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h3 className="fw-bold mb-0 text-white">⭐ Guest Reviews & Ratings Moderation</h3>
            <p className="text-light opacity-75 small mb-0">
              Customer experience feedback, product reviews, and testimonials
            </p>
          </div>

          <button className="btn btn-sm btn-outline-light rounded-pill" onClick={fetchFeedbacks}>
            🔄 Refresh Reviews
          </button>
        </div>
      </div>

      <AdminNavbar />

      <div className="container-fluid px-3 px-lg-4 pb-5 flex-grow-1">
        <div className="chai-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Guest Name & Email</th>
                  <th>Product Reviewed</th>
                  <th>Rating</th>
                  <th>Review Comment</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border text-warning" role="status"></div>
                    </td>
                  </tr>
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No customer reviews submitted yet.
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((f) => (
                    <tr key={f._id}>
                      <td>
                        <strong className="d-block small">{f.userName || "Customer"}</strong>
                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>{f.userEmail}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {f.productName || "General Café Experience"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex text-warning">
                          {[...Array(f.rating || 5)].map((_, i) => (
                            <Star key={i} size={14} fill="#F59E0B" />
                          ))}
                        </div>
                      </td>
                      <td className="small" style={{ maxWidth: "340px", lineHeight: 1.4 }}>
                        "{f.comment}"
                      </td>
                      <td className="small text-muted">
                        {new Date(f.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-icon text-danger"
                          onClick={() => handleDeleteFeedback(f._id)}
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
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

export default AdminFeedback;