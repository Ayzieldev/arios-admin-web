import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set up axios default headers
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      console.log('Token set in axios headers:', token);
    } else {
      console.log('No token found in localStorage');
    }
  }, []);

  // Load cart from database
  const loadCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Loading cart - Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('No token found, setting empty cart');
        setCart({ items: [], totalItems: 0, totalAmount: 0 });
        return;
      }

      console.log('Making cart request to /api/cart/');
              const response = await api.get('/cart/');
      console.log('Cart response:', response.data);
      setCart(response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
      console.error('Error response:', error.response?.data);
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when token changes
  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Adding to cart - Token:', token ? 'Present' : 'Missing');
      console.log('Product:', product._id, 'Quantity:', quantity);
      
      if (!token) {
        throw new Error('User not authenticated');
      }

              const response = await api.post('/cart/add', {
        productId: product._id,
        quantity: quantity
      });
      console.log('Add to cart response:', response.data);
      setCart(response.data);
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
              const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
              const response = await api.put(`/cart/update/${productId}`, {
        quantity: quantity
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
              const response = await api.delete('/cart/clear');
      setCart(response.data);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return cart.totalItems || 0;
  };

  const getTotalAmount = () => {
    return cart.totalAmount || 0;
  };

  const toggleCustomerMode = () => {
    setIsCustomerMode(!isCustomerMode);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalAmount,
    isCustomerMode,
    toggleCustomerMode,
    loading,
    loadCart
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}; 