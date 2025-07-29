import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CustomerProvider } from './contexts/CustomerContext';
import Layout from './components/Layout/Layout';
import CustomerLayout from './components/Layout/CustomerLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import ProductForm from './pages/ProductForm';
import CustomerProducts from './pages/CustomerProducts';
import CustomerCart from './pages/CustomerCart';
import CustomerOrders from './pages/CustomerOrders';
import Register from './pages/Register';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  console.log('🔍 App.js - User state:', user);
  console.log('🔍 App.js - Loading state:', loading);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // If user is customer, show customer interface
  if (user.role === 'customer') {
    return (
      <CustomerProvider>
        <CustomerLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/customer-products" replace />} />
            <Route path="/customer-products" element={<CustomerProducts />} />
            <Route path="/customer-cart" element={<CustomerCart />} />
            <Route path="/customer-orders" element={<CustomerOrders />} />
            <Route path="*" element={<Navigate to="/customer-products" replace />} />
          </Routes>
        </CustomerLayout>
      </CustomerProvider>
    );
  }

  // If user is admin or delivery, show admin interface
  return (
    <CustomerProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to={user.role === 'delivery' ? '/orders' : '/dashboard'} replace />} />
          {user.role === 'admin' && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />
              <Route path="/users" element={<Users />} />
            </>
          )}
          <Route path="/orders" element={<Orders />} />
          <Route path="/customer-products" element={<CustomerProducts />} />
          <Route path="/customer-cart" element={<CustomerCart />} />
          <Route path="*" element={<Navigate to={user.role === 'delivery' ? '/orders' : '/dashboard'} replace />} />
        </Routes>
      </Layout>
    </CustomerProvider>
  );
}

export default App; 