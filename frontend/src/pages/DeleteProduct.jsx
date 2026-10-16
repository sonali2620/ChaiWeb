import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";

const DeleteProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await API.get("/products");
        const list = res.data?.data || [];
        setProducts(list);
        if (list.length > 0) {
          setSelectedId(list[0].productId);
        }
      } catch (e) {}
    };
    fetchList();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm(`Are you sure you want to permanently delete product ID "${selectedId}"?`)) return;

    setLoading(true);
    try {
      await API.delete(`/products/${selectedId}`);
      toast.success("Product Deleted Successfully ✅");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      <div className="bg-white border-bottom py-3 px-4 shadow-sm mb-4">
        <h4 className="fw-bold mb-0 text-danger">🗑️ Delete Product</h4>
      </div>

      <AdminNavbar />

      <div className="container pb-5 flex-grow-1">
        <div className="chai-card p-4 max-w-600 mx-auto text-center" style={{ maxWidth: "500px" }}>
          <AlertTriangle size={48} className="text-danger mb-3 mx-auto" />
          <h5 className="fw-bold mb-2">Select Product to Delete</h5>
          <p className="text-muted small mb-4">
            Warning: This will permanently remove the item from the customer menu.
          </p>

          <div className="mb-4 text-start">
            <label className="form-label fw-semibold small">Choose Product:</label>
            <select
              className="form-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.p_name} ({p.productId}) — ₹{p.price}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary flex-fill"
              onClick={() => navigate("/admin/products")}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger flex-fill py-2"
              onClick={handleDelete}
              disabled={loading || !selectedId}
            >
              {loading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProduct;