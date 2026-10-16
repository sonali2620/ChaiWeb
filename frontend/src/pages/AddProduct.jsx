import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import { Coffee, Plus, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    productId: `ITEM${Date.now().toString().slice(-4)}`,
    p_name: "",
    price: "",
    category: "CHAI",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
    isAvailable: true,
    isBestseller: false,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 50,
    lowStockThreshold: 10,
    ingredients: "Assam CTC Tea, Crushed Ginger, Cardamom, Milk"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!product.productId || !product.p_name || !product.price) {
      toast.warning("Product ID, Name, and Price are required!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...product,
        price: Number(product.price),
        stockQuantity: Number(product.stockQuantity),
        lowStockThreshold: Number(product.lowStockThreshold),
        ingredients: typeof product.ingredients === "string"
          ? product.ingredients.split(",").map((i) => i.trim()).filter(Boolean)
          : product.ingredients
      };

      const res = await API.post("/products", payload);
      if (res.data?.status === "success" || res.data?.data) {
        toast.success("Product Added Successfully ✅");
        navigate("/admin/products");
      } else {
        toast.error(res.data?.error || "Failed to add product");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      <div className="bg-white border-bottom py-3 px-4 shadow-sm mb-4">
        <h4 className="fw-bold mb-0">➕ Add New Product to Menu</h4>
      </div>

      <AdminNavbar />

      <div className="container pb-5 flex-grow-1">
        <div className="chai-card p-4 max-w-600 mx-auto" style={{ maxWidth: "600px" }}>
          <form onSubmit={handleAdd}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Product ID *</label>
                <input
                  name="productId"
                  className="form-control"
                  value={product.productId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Product Name *</label>
                <input
                  name="p_name"
                  className="form-control"
                  placeholder="e.g. Masala Chai"
                  value={product.p_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  className="form-control"
                  placeholder="35"
                  value={product.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={product.category}
                  onChange={handleChange}
                >
                  <option value="CHAI">CHAI</option>
                  <option value="COFFEE">COFFEE</option>
                  <option value="SNACKS">SNACKS</option>
                  <option value="COMBOS">COMBOS</option>
                  <option value="SPECIALS">SPECIALS</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Image URL</label>
                <input
                  name="imageUrl"
                  type="url"
                  className="form-control"
                  value={product.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Initial Stock Qty</label>
                <input
                  name="stockQuantity"
                  type="number"
                  className="form-control"
                  value={product.stockQuantity}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Low Stock Alert Limit</label>
                <input
                  name="lowStockThreshold"
                  type="number"
                  className="form-control"
                  value={product.lowStockThreshold}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Ingredients (Comma Separated)</label>
                <input
                  name="ingredients"
                  className="form-control"
                  value={product.ingredients}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="2"
                  value={product.description}
                  onChange={handleChange}
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
                {loading ? "Adding Product..." : "Create Product ☕"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;