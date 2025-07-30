import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  FiMenu, 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiTruck,
  FiBell,
  FiUser,
  FiLogOut,
  FiBarChart
} from 'react-icons/fi';
import ariosLogo from '../../Assets/Arios Logo.png';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up periodic refresh for notifications (every 30 seconds)
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔔 Fetching notifications for user:', user?.name);
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📨 Notifications received:', response.data.length);
      setNotifications(response.data);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🔢 Unread count:', response.data.count);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, roles: ['admin'] },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart, roles: ['admin'] },
    { name: 'Products', href: '/products', icon: FiPackage, roles: ['admin'] },
    { name: 'Orders', href: '/orders', icon: FiShoppingCart, roles: ['admin', 'delivery'] },
    { name: 'Users', href: '/users', icon: FiUsers, roles: ['admin'] },
  ];

  const filteredNavigation = adminNavigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`layout ${user?.role === 'delivery' ? 'delivery-layout' : ''}`}>
      {/* Sidebar - Hidden for delivery role */}
      {user?.role !== 'delivery' && (
        <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Logo Section */}
          <div className="sidebar-header">
            <div className="logo-container">
              <div className="logo-icon">
                <img src={ariosLogo} alt="Arios Logo" className="logo-image" />
              </div>
            </div>
            <button 
              className="sidebar-close"
              onClick={() => setSidebarOpen(false)}
            >
              &times;
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="nav-icon" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            {user?.role !== 'delivery' && (
              <button 
                className="menu-button"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu />
              </button>
            )}
          </div>

          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar">
                <FiUser />
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
              </div>
            </div>
            <button 
              className="logout-button" 
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out?')) {
                  logout();
                }
              }}
              title="Sign Out"
            >
              <FiLogOut />
            </button>
            <div className="notification-badge" onClick={() => setShowNotifications(!showNotifications)}>
              <FiBell />
              {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>&times;</button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <p className="no-notifications">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification._id} 
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <small>{new Date(notification.createdAt).toLocaleString()}</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Mobile Overlay - Hidden for delivery role */}
      {sidebarOpen && user?.role !== 'delivery' && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 