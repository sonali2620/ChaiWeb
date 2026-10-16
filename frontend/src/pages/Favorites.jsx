import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import Footer from "../components/Footer";
import { Heart, ArrowRight, Coffee } from "lucide-react";

const Favorites = () => {
  const { favorites, token } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchFavoriteItems = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/customer/favorites");
        if (res.data?.data) {
          setFavoriteProducts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteItems();
  }, [favorites, token]);

  return (
    <div className="favorites-page min-vh-100 d-flex flex-column" style={{ background: "var(--bg-page)" }}>
      <div className="bg-white border-bottom py-4 shadow-sm mb-4">
        <div className="container">
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "var(--primary-darker)" }}>
            <Heart size={26} className="text-danger fill-danger" /> My Saved Favorites
          </h2>
          <p className="text-muted mb-0 small">
            Quickly order your favorite teas, coffees, and snacks anytime.
          </p>
        </div>
      </div>

      <div className="container flex-grow-1 pb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : !token ? (
          <div className="chai-card text-center p-5 max-w-600 mx-auto my-5" style={{ maxWidth: "500px" }}>
            <Heart size={44} className="text-danger mb-3" />
            <h4 className="fw-bold">Login to View Wishlist</h4>
            <p className="text-muted mb-4">Sign in to save your favorite chai & snacks across devices.</p>
            <Link to="/login?redirect=/favorites" className="btn btn-chai-primary">
              Login to Your Account
            </Link>
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="chai-card text-center p-5 max-w-600 mx-auto my-5" style={{ maxWidth: "500px" }}>
            <div className="mb-3" style={{ fontSize: "3rem" }}>❤️</div>
            <h4 className="fw-bold">No Favorites Saved Yet</h4>
            <p className="text-muted mb-4">
              Click the heart icon on any tea or snack in our menu to save it here for fast 1-click reordering!
            </p>
            <Link to="/products" className="btn btn-chai-primary">
              <Coffee size={18} /> Browse Menu
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favoriteProducts.map((p) => (
              <div key={p._id || p.productId} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard product={p} onQuickView={(prod) => setSelectedProduct(prod)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Favorites;
