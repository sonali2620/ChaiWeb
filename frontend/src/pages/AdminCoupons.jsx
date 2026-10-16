import { useState, useEffect } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import { Tag, Plus, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "react-toastify";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: 10,
    minOrder: 100,
    maxDiscount: 50,
    description: ""
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get("/coupons/all");
      setCoupons(res.data?.data || []);
    } catch (e) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) {
      toast.warning("Coupon code is required");
      return;
    }

    try {
      const res = await API.post("/coupons", newCoupon);
      if (res.data?.data) {
        toast.success(`Coupon ${newCoupon.code.toUpperCase()} created! 🎟️`);
        setShowAddModal(false);
        setNewCoupon({
          code: "",
          discountType: "PERCENT",
          discountValue: 10,
          minOrder: 100,
          maxDiscount: 50,
          description: ""
        });
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await API.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="admin-coupons min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      <div
        className="py-4 px-3 px-lg-4 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary-darker) 0%, #1A110B 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h3 className="fw-bold mb-0 text-white">🎟️ Promo Codes & Offers Management</h3>
            <p className="text-light opacity-75 small mb-0">
              Create and manage customer discounts, percentage off, and flat savings
            </p>
          </div>

          <button
            className="btn btn-sm btn-warning text-dark fw-bold rounded-pill"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} className="me-1" /> Create Promo Coupon
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
                  <th>Coupon Code</th>
                  <th>Discount Type & Value</th>
                  <th>Min Order Value</th>
                  <th>Max Discount Limit</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-warning" role="status"></div>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No promo coupons configured yet. Click "Create Promo Coupon".
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong className="badge bg-warning bg-opacity-25 text-dark fs-6 px-3 py-1 font-monospace">
                          {c.code}
                        </strong>
                      </td>
                      <td className="fw-semibold">
                        {c.discountType === "PERCENT" ? `${c.discountValue}% OFF` : `Flat ₹${c.discountValue} OFF`}
                      </td>
                      <td>₹{c.minOrder || 0}</td>
                      <td>₹{c.maxDiscount || "Unlimited"}</td>
                      <td className="small text-muted">{c.description || "N/A"}</td>
                      <td>
                        <span className="badge bg-success small">ACTIVE ✓</span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-icon text-danger"
                          onClick={() => handleDeleteCoupon(c._id)}
                          title="Delete Coupon"
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

      {/* Modal */}
      {showAddModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-custom p-4" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0">🎟️ Create Promo Coupon</h5>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  className="form-control form-control-sm text-uppercase font-monospace"
                  placeholder="e.g. MONSOON20"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small">Discount Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold small">Discount Value *</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="15"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small">Min Order (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="100"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: e.target.value })}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold small">Max Discount Limit (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="50"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Offer Description</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Enjoy 20% OFF on all hot chai orders above ₹100"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-chai-primary px-4">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
