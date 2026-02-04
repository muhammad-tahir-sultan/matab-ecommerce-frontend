import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { cartApi } from '../utils/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated } = useAuth();

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setCartItems([]);
      return;
    }

    try {
      const data = await cartApi.getCart();
      // Adjust based on actual API response structure. 
      // If getCart returns { items: [...] } or just [...]
      // Previous code assumed array directly: const data = await response.json(); setCartItems(data);
      // Let's assume cartApi.getCart() returns the data directly.
      const items = Array.isArray(data) ? data : (data.items || []);

      setCartItems(items);
      setCartCount(items.length);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const updateCartCount = (newCount) => {
    setCartCount(newCount);
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error("Please login to add items to cart");
    }

    await cartApi.addToCart(productId, quantity);
    await fetchCartCount();
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await cartApi.removeFromCart(productId);
      await fetchCartCount();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await cartApi.updateCartItem(productId, quantity);
      await fetchCartCount();
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  // Fetch cart count when authentication status changes
  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const value = {
    cartCount,
    cartItems,
    fetchCartCount,
    updateCartCount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 