import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { X, Star, Heart, ShoppingBag, Plus, Minus, Check, ShieldCheck, Flame, Leaf } from "lucide-react";
import { toast } from "react-toastify";

const ProductDetailModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isFavorited, toggleFavorite, token } = useAuth();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const favorited = isFavorited(product.productId || product._id);

  const handleFavorite = async () => {
    if (!token) {
      toast.info("Please login to save favorites ❤️");
      return;
    }
    await toggleFavorite(product.productId || product._id);
  };

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0 || !product.isAvailable) {
      toast.warning("Sorry, this item is out of stock!");
      return;
    }
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-content-custom position-relative p-0" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-icon position-absolute top-0 end-0 m-3 z-3 shadow-sm bg-white"
          style={{ width: "36px", height: "36px" }}
        >
          <X size={20} />
        </button>

        {/* Modal Image */}
        <div className="position-relative" style={{ height: "260px", background: "#F2E8DC" }}>
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
            alt={product.p_name}
            className="w-100 h-100 object-fit-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800";
            }}
          />

          <div className="position-absolute bottom-0 start-0 m-3 d-flex gap-2">
            <span className="badge bg-dark bg-opacity-75 text-white px-3 py-2 rounded-pill">
              ☕ {product.category || "CHAI"}
            </span>
            {product.isBestseller && (
              <span className="badge badge-bestseller px-3 py-2 rounded-pill">
                ⭐ BESTSELLER
              </span>
            )}
          </div>
        </div>

        {/* Details Content */}
        <div className="p-4">
          <div className="d-flex align-items-start justify-content-between mb-2">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: "var(--primary-darker)" }}>
                {product.p_name}
              </h4>
              <div className="d-flex align-items-center gap-2">
                <span className="badge-veg">
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }}></span>
                  100% PURE VEG
                </span>
                <div className="d-flex align-items-center gap-1 text-warning fw-bold small">
                  <Star size={14} fill="#F59E0B" />
                  <span>{product.rating || 4.9}</span>
                  <span className="text-muted fw-normal">({product.ratingCount || 42} reviews)</span>
                </div>
              </div>
            </div>

            <button
              className={`btn-icon ${favorited ? "text-danger fill-danger" : ""}`}
              onClick={handleFavorite}
              title="Add to Wishlist"
            >
              <Heart size={20} fill={favorited ? "#EF4444" : "none"} />
            </button>
          </div>

          <p className="text-muted my-3" style={{ lineHeight: 1.6 }}>
            {product.description || "Freshly brewed using authentic heritage recipe, whole spices, and rich milk."}
          </p>

          {/* Ingredients list if present */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "0.9rem" }}>
                🌿 Key Ingredients & Spices
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {product.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="badge bg-light text-dark border px-3 py-2 rounded-pill"
                    style={{ fontSize: "0.8rem", fontWeight: 500 }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Value Props */}
          <div className="row g-2 mb-4 p-3 bg-light rounded-3 text-secondary small">
            <div className="col-4 d-flex align-items-center gap-2">
              <Flame size={16} className="text-danger" />
              <span>Served Boiling Hot</span>
            </div>
            <div className="col-4 d-flex align-items-center gap-2">
              <Leaf size={16} className="text-success" />
              <span>No Preservatives</span>
            </div>
            <div className="col-4 d-flex align-items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              <span>100% Hygienic</span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="d-flex align-items-center justify-content-between pt-3 border-top">
            <div>
              <span className="text-muted small d-block">Total Price</span>
              <h3 className="fw-bold mb-0" style={{ color: "var(--primary)" }}>
                ₹{product.price * qty}
              </h3>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Qty Selector */}
              <div className="d-flex align-items-center border rounded-pill bg-light p-1">
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-dark text-decoration-none px-2"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="px-2 fw-bold" style={{ minWidth: "24px", textAlign: "center" }}>
                  {qty}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-dark text-decoration-none px-2"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                className={`btn ${added ? "btn-success" : "btn-chai-primary"} py-2 px-4`}
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stockQuantity <= 0}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart (₹{product.price * qty})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
