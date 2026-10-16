import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Heart, Star, ShoppingBag, Plus, Minus, Check, Eye } from "lucide-react";
import { toast } from "react-toastify";

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isFavorited, toggleFavorite, token } = useAuth();

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const favorited = isFavorited(product.productId || product._id);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!token) {
      toast.info("Please login to save favorites ❤️");
      return;
    }
    await toggleFavorite(product.productId || product._id);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0 || !product.isAvailable) {
      toast.warning("Sorry, this item is out of stock!");
      return;
    }
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="chai-card h-100 d-flex flex-column" onClick={() => onQuickView && onQuickView(product)}>
      {/* 🖼️ Product Image with Badges */}
      <div className="position-relative overflow-hidden" style={{ height: "200px", background: "#F7F2EB" }}>
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800"}
          alt={product.p_name || "Chai Item"}
          className="w-100 h-100 object-fit-cover"
          style={{ transition: "transform 0.4s ease" }}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800";
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />

        {/* Top Badges */}
        <div className="card-badge-top d-flex flex-column gap-1">
          {product.isBestseller && (
            <span className="badge-bestseller">⭐ BESTSELLER</span>
          )}
          {product.isSpecial && !product.isBestseller && (
            <span className="badge-special">🔥 SPECIAL</span>
          )}
          {product.discountPercent > 0 && (
            <span className="badge bg-danger text-white rounded-pill px-2 py-1" style={{ fontSize: "0.7rem" }}>
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className={`favorite-btn ${favorited ? "favorited" : ""}`}
          onClick={handleFavorite}
          title={favorited ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart size={18} fill={favorited ? "#EF4444" : "none"} />
        </button>

        {/* Quick View Hover Button */}
        <div
          className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-center"
          style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.4))" }}
        >
          <span className="badge bg-dark bg-opacity-75 text-white d-flex align-items-center gap-1 py-1 px-2" style={{ fontSize: "0.75rem" }}>
            <Eye size={12} /> Click for details & ingredients
          </span>
        </div>
      </div>

      {/* 📝 Card Body */}
      <div className="p-3 d-flex flex-column flex-grow-1">
        {/* Category & Veg Badge */}
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="badge-veg">
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }}></span>
            VEG
          </span>
          <span className="badge bg-light text-secondary border" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
            {product.category || "CHAI"}
          </span>
        </div>

        {/* Product Title */}
        <h5 className="fw-bold mb-1 text-truncate" style={{ fontSize: "1.05rem" }} title={product.p_name}>
          {product.p_name || "Chai Special"}
        </h5>

        {/* Short Description */}
        <p
          className="text-muted small mb-2 flex-grow-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            minHeight: "2.8em"
          }}
        >
          {product.description || "Freshly brewed with authentic ingredients."}
        </p>

        {/* Rating & Stock */}
        <div className="d-flex align-items-center justify-content-between mb-3" style={{ fontSize: "0.82rem" }}>
          <div className="d-flex align-items-center gap-1 text-warning fw-bold">
            <Star size={14} fill="#F59E0B" />
            <span>{product.rating || 4.8}</span>
            <span className="text-muted fw-normal">({product.ratingCount || 18})</span>
          </div>

          <div>
            {product.stockQuantity > 0 && product.isAvailable ? (
              product.stockQuantity <= (product.lowStockThreshold || 10) ? (
                <span className="text-danger fw-semibold" style={{ fontSize: "0.75rem" }}>
                  Only {product.stockQuantity} left!
                </span>
              ) : (
                <span className="text-success fw-semibold" style={{ fontSize: "0.75rem" }}>
                  ✓ In Stock
                </span>
              )
            ) : (
              <span className="badge bg-secondary" style={{ fontSize: "0.72rem" }}>
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Controls */}
        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
          <div>
            <span className="text-muted small" style={{ fontSize: "0.75rem" }}>Price</span>
            <h5 className="fw-bold mb-0" style={{ color: "var(--primary)" }}>
              ₹{product.price}
            </h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Quantity Selector */}
            <div className="d-flex align-items-center border rounded-pill bg-light p-1">
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-dark text-decoration-none px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setQty((q) => Math.max(1, q - 1));
                }}
              >
                <Minus size={12} />
              </button>
              <span className="px-1 fw-bold" style={{ fontSize: "0.85rem", minWidth: "16px", textAlign: "center" }}>
                {qty}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-link p-0 text-dark text-decoration-none px-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setQty((q) => q + 1);
                }}
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Add Button */}
            <button
              type="button"
              className={`btn btn-sm ${added ? "btn-success" : "btn-chai-primary"} py-2 px-3`}
              style={{ borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}
              onClick={handleAddToCart}
              disabled={!product.isAvailable || product.stockQuantity <= 0}
            >
              {added ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
