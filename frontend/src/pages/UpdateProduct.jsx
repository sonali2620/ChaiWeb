import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import { Edit2, Save, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    p_name: "",
    price: "",
    category: "CHAI",
    description: "",
    imageUrl: "",
    stockQuantity: 50
  });

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await API.get("/products");
        const list = res.data?.data || [];
        setProducts(list);
        if (list.length > 0) {
          selectProduct(list[0]);
        }
      } catch (e) {}
    };
    fetchList();
  }, []);

  const selectProduct = (prod) => {
    setSelectedId(prod.productId);
    setForm({
      productId: prod.productId,
      p_name: prod.p_name || "",
      price: prod.price || "",
      category: prod.category || "CHAI",
      description: prod.description || "",
      imageUrl: prod.imageUrl || "",
      stockQuantity: prod.stockQuantity || 50
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/products/${form.productId}`, {
        ...form,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity)
      });
      toast.success("Product updated successfully! ✅");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      <div className="bg-white border-bottom py-3 px-4 shadow-sm mb-4">
        <h4 className="fw-bold mb-0">✏️ Update Product</h4>
      </div>

      <AdminNavbar />

      <div className="container pb-5 flex-grow-1">
        <div className="chai-card p-4 max-w-600 mx-auto" style={{ maxWidth: "600px" }}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Select Product to Edit</label>
            <select
              className="form-select"
              value={selectedId}
              onChange={(e) => {
                const found = products.find((p) => p.productId === e.target.value);
                if (found) selectProduct(found);
              }}
            >
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.p_name} ({p.productId}) — ₹{p.price}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Product Name</label>
                <input
                  className="form-control"
                  value={form.p_name}
                  onChange={(e) => setForm({ ...form, p_name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="CHAI">CHAI</option>
                  <option value="COFFEE">COFFEE</option>
                  <option value="SNACKS">SNACKS</option>
                  <option value="COMBOS">COMBOS</option>
                  <option value="SPECIALS">SPECIALS</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Stock Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/admin/products")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-chai-primary flex-fill py-2"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Product Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;