import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiPackage, FiCalendar, FiMapPin, FiDollarSign, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../style/CustomerOrders.css';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders/my-orders');
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ffa500';
      case 'processing':
        return '#1976d2';
      case 'shipped':
        return '#4caf50';
      case 'delivered':
        return '#2e7d32';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="customer-orders">
      <div className="orders-header">
        <div className="header-content">
          <div className="header-left">
            <h1>My Orders</h1>
            <p>Track your order history and delivery status</p>
          </div>
          <div className="header-actions">
            <Link to="/customer-products" className="action-btn products-btn">
              <FiHome />
              <span>View Products</span>
            </Link>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <FiPackage className="no-orders-icon" />
          <h2>No orders yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <Link to="/customer-products" className="view-products-btn">
            <FiHome />
            <span>View Products</span>
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <div className="order-meta">
                    <span className="order-date">
                      <FiCalendar />
                      {formatDate(order.createdAt)}
                    </span>
                    <span 
                      className="order-status-badge"
                      style={{ color: getStatusColor(order.status) }}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="order-total">
                  <FiDollarSign />
                  <span>₱{order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-details">
                <div className="delivery-info">
                  <h4>Delivery Information</h4>
                  <div className="delivery-address">
                    <FiMapPin />
                    <span>
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <h4>Order Items ({order.items.length})</h4>
                  <div className="items-list">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <span className="item-name">{item.product.name}</span>
                          <span className="item-quantity">Qty: {item.quantity}</span>
                        </div>
                        <span className="item-price">₱{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {order.status === 'delivered' && (
                <div className="order-actions">
                  <button className="reorder-btn">Reorder</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders; 