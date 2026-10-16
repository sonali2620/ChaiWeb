import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await API.get("/user/me");
          if (res.data?.data) {
            setUser(res.data.data);
            setFavorites(res.data.data.favorites || []);
            localStorage.setItem("user", JSON.stringify(res.data.data));
            localStorage.setItem("role", res.data.data.role);
          }
        } catch (err) {
          console.log("Auth session expired or offline fallback");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Login handler
  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userData.role || "CUSTOMER");
  };

  // Logout handler
  const logout = () => {
    setToken("");
    setUser(null);
    setFavorites([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  // Toggle favorite
  const toggleFavorite = async (productId) => {
    if (!token) return false;

    try {
      const res = await API.post("/customer/favorites/toggle", { productId });
      if (res.data?.data?.favorites) {
        setFavorites(res.data.data.favorites);
        return res.data.data.isFavorited;
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
    return false;
  };

  const isFavorited = (productId) => {
    return favorites.includes(productId);
  };

  const isAdmin = user?.role === "ADMIN" || localStorage.getItem("role") === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAdmin,
        favorites,
        loading,
        login,
        logout,
        toggleFavorite,
        isFavorited
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
