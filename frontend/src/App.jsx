import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Feedback from "./pages/feedback";

import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AddProduct from "./pages/AddProduct";
import DeleteProduct from "./pages/DeleteProduct";
import UpdateProduct from "./pages/UpdateProduct";
import AdminFeedback from "./pages/AdminFeedback";
import AdminCoupons from "./pages/AdminCoupons";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-layout min-vh-100 d-flex flex-column position-relative">
          {/* Global Sticky Modern Navbar */}
          <Navbar />

          {/* Main Application Routes */}
          <main className="flex-grow-1">
            <Routes>
              {/* Public & Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Product />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/feedback" element={<Feedback />} />

              {/* Customer Protected Routes */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminCoupons />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/feedback"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedbacks"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-product"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/update-product"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <UpdateProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delete-product"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <DeleteProduct />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Floating AI Chai Assistant Chatbot */}
          <Chatbot />

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={2200}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
