import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['x-auth-token'] = token;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/user');
      setUser(response.data);
    } catch (error) {
      console.error('❌ Check auth failed:', error.response?.data || error.message);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('✅ Login successful:', user);
      console.log('🔑 Token received:', token ? 'Yes' : 'No');
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['x-auth-token'] = token;
      setUser(user);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
          localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];
      setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 