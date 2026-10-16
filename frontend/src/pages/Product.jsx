import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import Footer from "../components/Footer";
import {
  Search,
  Filter,
  ArrowUpDown,
  Coffee,
  Sparkles,
  X,
  SlidersHorizontal,
  Flame,
  Check
} from "lucide-react";
import { toast } from "react-toastify";

const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("popularity");
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState("ALL");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== "ALL") params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (vegOnly) params.vegOnly = "true";
      if (sortBy) params.sortBy = sortBy;

      const res = await API.get("/products", { params });
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      const res = await API.get("/recommendations", {
        params: { currentCategory: selectedCategory }
      });
      if (res.data?.data?.products) {
        setRecommendations(res.data.data.products);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchRecommendations();
  }, [selectedCategory, sortBy, vegOnly]);

  // Client-side search debounce or filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.p_name || "").toLowerCase().includes(q);
        const matchDesc = (p.description || "").toLowerCase().includes(q);
        const matchCat = (p.category || "").toLowerCase().includes(q);
        const matchIng = (p.ingredients || []).some((i) => i.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCat && !matchIng) return false;
      }

      // Price filter
      if (selectedPriceRange === "UNDER_50" && p.price > 50) return false;
      if (selectedPriceRange === "50_TO_100" && (p.price < 50 || p.price > 100)) return false;
      if (selectedPriceRange === "ABOVE_100" && p.price < 100) return false;

      return true;
    });
  }, [products, searchQuery, selectedPriceRange]);

  const categories = [
    { label: "All Items", value: "ALL", icon: "✨" },
    { label: "Chai & Teas", value: "CHAI", icon: "☕" },
    { label: "Filter Coffee", value: "COFFEE", icon: "☕" },
    { label: "Bakery & Snacks", value: "SNACKS", icon: "🍔" },
    { label: "Value Combos", value: "COMBOS", icon: "🍱" },
    { label: "Chef Specials", value: "SPECIALS", icon: "👑" }
  ];

  return (
    <div className="product-menu-page min-vh-100 d-flex flex-column">
      {/* Header Banner */}
      <div
        className="py-5 text-center text-white position-relative"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div className="container">
          <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold mb-2">
            FRESHLY BREWED TO ORDER
          </span>
          <h1 className="fw-bold mb-2 text-white">Chai Adda Café Menu</h1>
          <p className="text-light opacity-75 max-w-600 mx-auto mb-0" style={{ maxWidth: "520px" }}>
            Explore our authentic Assam teas, earthen clay Kulhad chai, South Indian filter coffee, and delicious hot snacks.
          </p>
        </div>
      </div>

      <div className="container py-4 flex-grow-1">
        {/* 🔍 Search & Filters Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4" style={{ background: "#FFFFFF" }}>
          <div className="row g-3 align-items-center">
            {/* Search Box */}
            <div className="col-12 col-md-5">
              <div className="position-relative">
                <Search
                  size={18}
                  className="position-absolute text-muted"
                  style={{ top: "12px", left: "14px" }}
                />
                <input
                  type="text"
                  className="form-control ps-5 py-2 rounded-pill bg-light border-0"
                  placeholder="Search Masala Chai, Bun Maska, Samosa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: "0.92rem" }}
                />
                {searchQuery && (
                  <button
                    className="btn btn-sm btn-link text-muted position-absolute end-0 top-50 translate-middle-y me-2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-2">
                <ArrowUpDown size={16} className="text-secondary" />
                <select
                  className="form-select form-select-sm rounded-pill py-2 border-light"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ fontSize: "0.85rem" }}
                >
                  <option value="popularity">Most Popular 🔥</option>
                  <option value="rating">Top Rated ⭐</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Additions</option>
                </select>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm rounded-pill py-2 border-light"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                style={{ fontSize: "0.85rem" }}
              >
                <option value="ALL">Any Price</option>
                <option value="UNDER_50">Under ₹50</option>
                <option value="50_TO_100">₹50 – ₹100</option>
                <option value="ABOVE_100">Above ₹100</option>
              </select>
            </div>

            {/* Pure Veg Switch */}
            <div className="col-12 col-md-2 d-flex justify-content-md-end">
              <div className="form-check form-switch d-flex align-items-center gap-2 mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="vegSwitch"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <label className="form-check-label fw-semibold small text-success" htmlFor="vegSwitch" style={{ cursor: "pointer" }}>
                  🌱 Pure Veg Only
                </label>
              </div>
            </div>
          </div>

          {/* 🏷️ Category Pills */}
          <div className="d-flex align-items-center gap-2 overflow-x-auto pt-3 border-top mt-3 pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-pill ${selectedCategory === cat.value ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setSearchParams(cat.value === "ALL" ? {} : { category: cat.value });
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📦 Product Grid / Results */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading freshly brewed items...</span>
            </div>
            <p className="mt-3 text-muted">Brewing our menu for you ☕...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="chai-card p-5 text-center my-4">
            <div className="mb-3" style={{ fontSize: "3rem" }}>😕</div>
            <h4 className="fw-bold">No products found</h4>
            <p className="text-muted">
              We couldn't find any tea or snacks matching your current search/filters.
            </p>
            <button
              className="btn btn-chai-primary mt-2"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedPriceRange("ALL");
                setVegOnly(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            {filteredProducts.map((p) => (
              <div key={p._id || p.productId} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard
                  product={p}
                  onQuickView={(prod) => setSelectedProduct(prod)}
                />
              </div>
            ))}
          </div>
        )}

        {/* 💡 Smart "You May Also Like" Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-5 pt-4 border-top">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Sparkles size={20} className="text-warning" />
              <h4 className="fw-bold mb-0" style={{ color: "var(--primary-darker)" }}>
                Recommended Pairings for Your Chai ☕
              </h4>
            </div>

            <div className="row g-3">
              {recommendations.slice(0, 4).map((rec) => (
                <div key={rec._id || rec.productId} className="col-12 col-sm-6 col-md-3">
                  <ProductCard product={rec} onQuickView={(prod) => setSelectedProduct(prod)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for quick view details */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Product;