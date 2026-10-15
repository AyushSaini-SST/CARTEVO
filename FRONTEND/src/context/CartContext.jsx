import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axiosInstance from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/cart");
      setCart(res.data.cart || []);
      setError(false);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const res = await axiosInstance.post(`/cart/${productId}`);
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to add" };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await axiosInstance.patch(`/cart/${productId}`, { quantity });
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to update" };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axiosInstance.delete(`/cart/${productId}`);
      setCart(res.data.cart);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Failed to remove" };
    }
  };

  // Derived values (Calculated on the fly, not stored in DB)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        totalItems,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);