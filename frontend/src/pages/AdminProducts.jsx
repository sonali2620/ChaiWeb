import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import {
  Coffee,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Star,
  Flame,
  X,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { toast } from "react-toastify";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    productId: "",
    p_name: "",
    price: "",
    category: "CHAI",
    description: "",
    imageUrl: "",
    isAvailable: true,
    isBestseller: false,
    isSpecial: false,
    isVeg: true,
    stockQuantity: 50,
    lowStockThreshold: 10,
    ingredients: ""
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/products");
      setProducts(res.data?.data || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentProduct({
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
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setIsEditing(true);
    setCurrentProduct({
      ...prod,
      ingredients: Array.isArray(prod.ingredients) ? prod.ingredients.join(", ") : (prod.ingredients || "")
    });
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct.productId || !currentProduct.p_name || !currentProduct.price) {
      toast.warning("Product ID, Name, and Price are required");
      return;
    }

    try {
      const payload = {
        ...currentProduct,
        price: Number(currentProduct.price),
        stockQuantity: Number(currentProduct.stockQuantity),
        lowStockThreshold: Number(currentProduct.lowStockThreshold),
        ingredients: typeof currentProduct.ingredients === "string"
          ? currentProduct.ingredients.split(",").map((i) => i.trim()).filter(Boolean)
          : currentProduct.ingredients
      };

      if (isEditing) {
        await API.put(`/products/${currentProduct.productId}`, payload);
        toast.success("Product updated successfully! ☕");
      } else {
        await API.post("/products", payload);
        toast.success("New product added to catalog! ☕");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product from the menu?")) return;

    try {
      await API.delete(`/products/${productId}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleToggleStock = async (prod) => {
    try {
      const newAvail = !prod.isAvailable;
      await API.patch(`/products/${prod.productId}/stock`, {
        isAvailable: newAvail
      });
      setProducts((prev) =>
        prev.map((p) => (p.productId === prod.productId ? { ...p, isAvailable: newAvail } : p))
      );
      toast.info(`Item marked as ${newAvail ? "Available" : "Out of Stock"}`);
    } catch (err) {
      toast.error("Failed to toggle availability");
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Reset all products to the default handcrafted Chai Adda menu?")) return;
    try {
      await API.post("/products/seed");
      toast.success("Default products restored successfully! 🌱");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to seed products");
    }
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (p.p_name || "").toLowerCase().includes(q);
      const matchId = (p.productId || "").toLowerCase().includes(q);
      return matchName || matchId;
    }
    return true;
  });

  return (
    <div className="admin-products-page min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <div
        className="py-4 px-3 px-lg-4 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary-darker) 0%, #1A110B 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div className="container-fluid d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h3 className="fw-bold mb-0 text-white">☕ Product Catalog & Inventory</h3>
            <p className="text-light opacity-75 small mb-0">
              Manage café beverages, bakery snacks, stock quantities, and pricing
            </p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-light rounded-pill" onClick={handleResetDefaults}>
              <RotateCcw size={14} className="me-1" /> Restore Default Menu
            </button>
            <button className="btn btn-sm btn-warning text-dark fw-bold rounded-pill" onClick={handleOpenAdd}>
              <Plus size={16} className="me-1" /> Add New Item
            </button>
          </div>
        </div>
      </div>

      <AdminNavbar />

      <div className="container-fluid px-3 px-lg-4 pb-5 flex-grow-1">
        {/* Controls */}
        <div className="chai-card p-3 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6">
              <div className="position-relative">
                <Search size={18} className="position-absolute text-muted" style={{ top: "12px", left: "14px" }} />
                <input
                  type="text"
                  className="form-control ps-5 py-2 rounded-pill bg-light border-0"
                  placeholder="Search by Product Name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 d-flex gap-2 overflow-x-auto pb-1">
              {["ALL", "CHAI", "COFFEE", "SNACKS", "COMBOS", "SPECIALS"].map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${
                    selectedCategory === cat ? "btn-chai-primary" : "btn-light border"
                  } rounded-pill px-3`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="chai-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted">
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock & Threshold</th>
                  <th>Tags & Flags</th>
                  <th>Availability</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-warning" role="status"></div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No products found. Click "Add New Item" to create one.
                    </td>
                  </tr>
                ) : (
                  filtered.map((prod) => (
                    <tr key={prod.productId}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={prod.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
                            alt={prod.p_name}
                            style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover" }}
                          />
                          <div>
                            <strong className="d-block small">{prod.p_name}</strong>
                            <span className="text-muted font-monospace" style={{ fontSize: "0.75rem" }}>
                              {prod.productId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {prod.category}
                        </span>
                      </td>
                      <td className="fw-bold text-success">₹{prod.price}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`fw-bold small ${
                              prod.stockQuantity <= (prod.lowStockThreshold || 10)
                                ? "text-danger"
                                : "text-dark"
                            }`}
                          >
                            {prod.stockQuantity} in stock
                          </span>
                          {prod.stockQuantity <= (prod.lowStockThreshold || 10) && (
                            <span className="badge bg-danger text-white small">LOW</span>
                          )}
                        </div>
                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                          Alert limit: {prod.lowStockThreshold || 10}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {prod.isBestseller && (
                            <span className="badge badge-bestseller small">BESTSELLER</span>
                          )}
                          {prod.isSpecial && (
                            <span className="badge badge-special small">SPECIAL</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            prod.isAvailable ? "btn-outline-success" : "btn-outline-secondary"
                          } py-1 px-3 rounded-pill`}
                          style={{ fontSize: "0.78rem" }}
                          onClick={() => handleToggleStock(prod)}
                        >
                          {prod.isAvailable ? "✓ In Stock" : "✗ Out of Stock"}
                        </button>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-icon"
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-icon text-danger"
                            onClick={() => handleDeleteProduct(prod.productId)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✏️ Add / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop-custom" onClick={() => setShowModal(false)}>
          <div className="modal-content-custom p-4" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
            <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
              <h5 className="fw-bold mb-0">
                {isEditing ? `Edit Product: ${currentProduct.p_name}` : "➕ Add New Menu Item"}
              </h5>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Product ID *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={currentProduct.productId}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, productId: e.target.value })}
                    disabled={isEditing}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Product Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Ginger Cardamom Chai"
                    value={currentProduct.p_name}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, p_name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="45"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Category *</label>
                  <select
                    className="form-select form-select-sm"
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
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
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={currentProduct.imageUrl}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, imageUrl: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={currentProduct.stockQuantity}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stockQuantity: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={currentProduct.lowStockThreshold}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, lowStockThreshold: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">Key Ingredients (Comma Separated)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Assam CTC Tea, Fresh Ginger, Cardamom, Milk"
                    value={currentProduct.ingredients}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, ingredients: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold small">Description</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    placeholder="Describe taste, aroma, and brewing method..."
                    value={currentProduct.description}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Flags Checkboxes */}
                <div className="col-12 d-flex flex-wrap gap-4 pt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="bestsellerCheck"
                      checked={currentProduct.isBestseller}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, isBestseller: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="bestsellerCheck">
                      ⭐ Mark as Bestseller
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="specialCheck"
                      checked={currentProduct.isSpecial}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, isSpecial: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="specialCheck">
                      🔥 Chef's Special
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="availCheck"
                      checked={currentProduct.isAvailable}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, isAvailable: e.target.checked })}
                    />
                    <label className="form-check-label small fw-semibold" htmlFor="availCheck">
                      ✓ Available for Order
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-sm btn-chai-primary px-4">
                  {isEditing ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
