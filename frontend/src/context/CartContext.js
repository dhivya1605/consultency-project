import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const getCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, price) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        { productId, quantity, price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        'http://localhost:5000/api/cart/item',
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId }
        }
      );
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    setLoading(true);
    try {
      const response = await axios.put(
        'http://localhost:5000/api/cart',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        'http://localhost:5000/api/cart',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateCartItem, clearCart, getCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
