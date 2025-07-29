import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut, FiMenu, FiX, FiHome, FiPackage, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomer } from '../../contexts/CustomerContext';
import ariosLogo from '../../Assets/Arios Logo.png';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCustomer();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="customer-layout">
      {/* Header */}
      <header className="customer-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-button" onClick={toggleSidebar}>
              <FiMenu />
            </button>
            <img src={ariosLogo} alt="Arios Logo" className="logo" />
          </div>

          <div className="header-right">
            <div className="user-info">
              <FiUser />
              <span>{user?.name || user?.email}</span>
            </div>
            
            <Link to="/customer-products" className="header-nav-link">
              <FiHome />
              <span>View Products</span>
            </Link>
            
            <Link to="/customer-orders" className="header-nav-link">
              <FiFileText />
              <span>View Orders</span>
            </Link>
            
            <Link to="/customer-cart" className="header-nav-link">
              <FiShoppingCart />
              <span>View Cart</span>
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </Link>

            <button className="logout-button" onClick={handleLogout}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`customer-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Arios Shop</h2>
          <button className="sidebar-close" onClick={closeSidebar}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/customer-products"
            className={`nav-link ${isActive('/customer-products') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FiHome />
            <span>Shop Products</span>
          </Link>

          <Link
            to="/customer-cart"
            className={`nav-link ${isActive('/customer-cart') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FiShoppingCart />
            <span>My Cart</span>
            {getTotalItems() > 0 && (
              <span className="nav-badge">{getTotalItems()}</span>
            )}
          </Link>

          <Link
            to="/customer-orders"
            className={`nav-link ${isActive('/customer-orders') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <FiFileText />
            <span>My Orders</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <FiUser />
            <div>
              <p className="user-name">{user?.name || 'Customer'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <main className="customer-main">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout; 