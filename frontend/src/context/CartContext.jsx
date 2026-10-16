import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const local = localStorage.getItem("chai_cart_items");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const c = localStorage.getItem("chai_cart_coupon");
      return c ? JSON.parse(c) : null;
    } catch {
      return null;
    }
  });

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem("chai_cart_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem("chai_cart_coupon", JSON.stringify(coupon));
    } else {
      localStorage.removeItem("chai_cart_coupon");
    }
  }, [coupon]);

  // Load from backend if logged in on startup
  useEffect(() => {
    const fetchBackendCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await API.get("/order/cart");
          if (res.data?.data && res.data.data.length > 0) {
            // merge backend items
            const backendItems = res.data.data.map((item) => ({
              productId: item.productId || item._id,
              productCustomId: item.productCustomId,
              name: item.productName || item.name || "Chai Special",
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              category: item.category || "CHAI"
            }));
            setItems(backendItems);
          }
        } catch (err) {
          // ignore offline/empty cart
        }
      }
    };
    fetchBackendCart();
  }, []);

  // Calculate pricing
  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  let discountAmount = 0;
  if (coupon && subtotal >= (coupon.minOrder || 0)) {
    if (coupon.discountType === "PERCENT") {
      const calculated = (subtotal * coupon.discountValue) / 100;
      discountAmount = Math.min(calculated, coupon.maxDiscount || calculated);
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const taxAmount = Math.round(subtotal * 0.05); // 5% GST on Restaurant / Cafe
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= 200 ? 0 : 30);
  const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount + deliveryFee);
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    const pId = product._id || product.productId;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === pId || i.productCustomId === product.productId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            productId: pId,
            productCustomId: product.productId,
            name: product.p_name || product.name,
            price: product.price,
            quantity,
            imageUrl: product.imageUrl,
            category: product.category || "CHAI"
          }
        ];
      }
    });

    toast.success(`☕ Added "${product.p_name || product.name}" to cart!`);

    // Sync to backend if authenticated
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await API.post("/order/add-to-cart", {
          productId: pId,
          quantity
        });
      } catch (err) {
        // logged in sync fallback
      }
    }
  };

  // Update item quantity
  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId || item.productCustomId === productId
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  // Remove single item
  const removeFromCart = (productId) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.productId !== productId && item.productCustomId !== productId
      )
    );
    toast.info("Item removed from cart");
  };

  // Clear entire cart
  const clearCart = async () => {
    setItems([]);
    setCoupon(null);
    localStorage.removeItem("chai_cart_items");
    localStorage.removeItem("chai_cart_coupon");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        await API.delete("/order/cart/clear");
      } catch (e) {}
    }
  };

  // Apply promo coupon
  const applyCoupon = async (code) => {
    try {
      const res = await API.post("/coupons/validate", {
        code,
        subtotal
      });

      if (res.data?.data) {
        setCoupon(res.data.data);
        toast.success(res.data.message || `Coupon "${code}" applied successfully! 🎉`);
        return { success: true };
      } else {
        toast.error(res.data?.error || "Invalid coupon code");
        return { success: false, error: res.data?.error };
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to apply coupon";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.info("Coupon removed");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        discountAmount,
        taxAmount,
        deliveryFee,
        grandTotal,
        coupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
