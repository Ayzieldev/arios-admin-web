import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiEye, FiUser, FiClock } from 'react-icons/fi';
import '../style/Orders.css';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'available', 'assigned', 'requests', 'daily'

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      // Set default tab based on role
      if (userRole === 'delivery' && activeTab === 'all') {
        setActiveTab('available');
      } else {
        fetchOrders();
      }
    }
  }, [userRole, activeTab]);

  const fetchUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 User role from token:', payload.role);
        setUserRole(payload.role);
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching orders with token:', token ? 'Present' : 'Missing');
      
      let endpoint = '/orders/all';
      
      // Role-based endpoint selection
      console.log('🎯 Current userRole:', userRole, 'activeTab:', activeTab);
      
      if (userRole === 'delivery') {
        if (activeTab === 'available') {
          endpoint = '/orders/delivery/available';
        } else if (activeTab === 'assigned') {
          endpoint = '/orders/delivery/assigned';
        }
      } else if (userRole === 'customer') {
        endpoint = '/orders';
            } else if (userRole === 'admin' && activeTab === 'requests') {
        endpoint = '/orders/delivery-requests';
      } else if (userRole === 'admin' && activeTab === 'daily') {
        endpoint = '/orders/daily';
      }
      
      console.log('🌐 Using endpoint:', endpoint);
      
      const response = await api.get(endpoint);
      
      console.log('✅ Orders fetched successfully:', response.data.length, 'orders');
      setOrders(response.data);
    } catch (error) {
      console.error('❌ Error fetching orders:', error.response?.status, error.response?.data);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const requestDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      await api.post(`/orders/${orderId}/request-delivery`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show success notification
      toast.success('Delivery request sent! Admin will review your request.');
      
      // Refresh orders to show updated request status
      fetchOrders();
      
      console.log('✅ Delivery request sent successfully');
    } catch (error) {
      console.error('❌ Error requesting delivery:', error.response?.status, error.response?.data);
      const message = error.response?.data?.message || 'Failed to request delivery';
      toast.error(message);
      setError('Failed to request delivery');
    }
  };

  const assignDelivery = async (orderId, deliveryBoyId) => {
    try {
      const token = localStorage.getItem('token');
      
              const response = await api.put(`/orders/${orderId}/assign-delivery`, 
        { deliveryBoyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Find the delivery person's name for notification
      const order = orders.find(o => o._id === orderId);
      const deliveryPerson = order?.deliveryRequests?.find(
        req => req.deliveryBoyId._id === deliveryBoyId
      )?.deliveryBoyId?.name || 'Delivery Person';
      
      // Show success notification
      toast.success(`Order assigned to ${deliveryPerson}! They have been notified.`);
      
      // Refresh the page to show updated status
      window.location.reload();
      
      console.log('✅ Order assigned successfully');
    } catch (error) {
      console.error('❌ Error assigning order:', error.response?.status, error.response?.data);
      const message = error.response?.data?.message || 'Failed to assign order';
      toast.error(message);
      setError('Failed to assign order');
    }
  };



  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
              const response = await api.put(`/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Show success notification
      if (newStatus === 'delivered') {
        toast.success('Order marked as delivered! Customer has been notified.');
      } else {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
      }
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      console.log('✅ Order status updated successfully');
    } catch (error) {
      console.error('❌ Error updating order status:', error.response?.status, error.response?.data);
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
      setError('Failed to update order status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiPackage className="status-icon pending" />;
      case 'confirmed':
        return <FiPackage className="status-icon confirmed" />;
      case 'out_for_delivery':
        return <FiTruck className="status-icon delivery" />;
      case 'delivered':
        return <FiCheckCircle className="status-icon delivered" />;
      case 'served':
        return <FiCheckCircle className="status-icon served" />;
      case 'cancelled':
        return <FiXCircle className="status-icon cancelled" />;
      default:
        return <FiPackage className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#3b82f6';
      case 'out_for_delivery':
        return '#0ea5e9';
      case 'delivered':
        return '#10b981';
      case 'served':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const hasRequestedDelivery = (order) => {
    if (!order.deliveryRequests || userRole !== 'delivery') return false;
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return order.deliveryRequests.some(request => 
        request.deliveryBoyId._id === payload.id
      );
    }
    return false;
  };

  const getDeliveryRequestsCount = (order) => {
    if (!order.deliveryRequests) return 0;
    return order.deliveryRequests.filter(request => request.status === 'pending').length;
  };

  const renderTabs = () => {
    if (userRole === 'delivery') {
      return (
        <div className="orders-tabs">
          <button 
            className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available Orders
          </button>
          <button 
            className={`tab-button ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            My Assigned Orders
          </button>
        </div>
      );
    } else if (userRole === 'admin') {
      return (
        <div className="orders-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          <button 
            className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            Daily Orders
          </button>
          <button 
            className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Delivery Requests
          </button>

        </div>
      );
    }
    return null;
  };

  const renderOrderActions = (order) => {
    if (userRole === 'admin') {
      return (
        <div className="action-buttons">
          <button
            onClick={() => viewOrderDetails(order)}
            className="btn btn-sm btn-outline"
            title="View Details"
          >
            <FiEye />
          </button>
          {(activeTab === 'all' || activeTab === 'daily') && (
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
              className="status-select"
              title="Change Status"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="served">Served</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          {activeTab === 'requests' && order.deliveryRequests && order.deliveryRequests.length > 0 && (
            <select
              onChange={(e) => assignDelivery(order._id, e.target.value)}
              className="delivery-assign-select"
              defaultValue=""
            >
              <option value="" disabled>Assign to...</option>
              {order.deliveryRequests
                .filter(request => request.status === 'pending')
                .map(request => (
                  <option key={request.deliveryBoyId._id} value={request.deliveryBoyId._id}>
                    {request.deliveryBoyId.name}
                  </option>
                ))}
            </select>
          )}

        </div>
      );
    } else if (userRole === 'delivery') {
      if (activeTab === 'available') {
        return (
          <div className="action-buttons">
            <button
              onClick={() => viewOrderDetails(order)}
              className="btn btn-sm btn-outline"
              title="View Details"
            >
              <FiEye />
            </button>
            {!hasRequestedDelivery(order) ? (
              <button
                onClick={() => requestDelivery(order._id)}
                className="btn btn-sm btn-primary"
                title="Request to Deliver"
              >
                Request Delivery
              </button>
            ) : (
              <span className="requested-badge">Requested</span>
            )}
          </div>
        );
      } else if (activeTab === 'assigned') {
        return (
          <div className="action-buttons">
            <button
              onClick={() => viewOrderDetails(order)}
              className="btn btn-sm btn-outline"
              title="View Details"
            >
              <FiEye />
            </button>

          </div>
        );
      }
    } else if (userRole === 'customer') {
      return (
        <div className="action-buttons">
          <button
            onClick={() => viewOrderDetails(order)}
            className="btn btn-sm btn-outline"
            title="View Details"
          >
            <FiEye />
          </button>
        </div>
      );
    }
    return null;
  };

  const renderPageTitle = () => {
    if (userRole === 'admin') {
      if (activeTab === 'requests') return 'Delivery Requests';
      if (activeTab === 'daily') return 'Daily Orders';
      return 'All Orders';
    } else if (userRole === 'delivery') {
      return activeTab === 'available' ? 'Available Orders' : 'My Assigned Orders';
    } else if (userRole === 'customer') {
      return 'My Orders';
    }
    return 'Orders';
  };

  const renderPageDescription = () => {
    if (userRole === 'admin' && activeTab === 'requests') {
      return 'Review and assign delivery requests from delivery personnel';
    } else if (userRole === 'admin' && activeTab === 'daily') {
      return 'View and manage orders placed today';
    } else if (userRole === 'admin') {
      return 'Manage and track all orders';
    } else if (userRole === 'delivery') {
      return activeTab === 'available' ? 'Request to deliver available orders' : 'Manage your assigned deliveries';
    } else if (userRole === 'customer') {
      return 'Track your order status';
    }
    return 'Manage and track order status';
  };

  if (loading) {
    return (
      <div className="orders">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h1>{renderPageTitle()}</h1>
        <p>{renderPageDescription()}</p>
      </div>

      {renderTabs()}

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No orders found</h3>
          <p>There are no orders to display at the moment.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className={`orders-table ${userRole === 'admin' && activeTab === 'requests' ? 'delivery-requests-table' : ''}`}>
            <thead>
              <tr>
                <th className="order-id">Order ID</th>
                <th className="customer-info">Customer</th>
                {userRole !== 'admin' || activeTab !== 'requests' ? (
                  <>
                    <th className="order-items">Items</th>
                    <th className="order-total">Total</th>
                    <th className="order-status">Status</th>
                  </>
                ) : null}
                <th className="order-date">Date</th>
                {userRole === 'admin' && activeTab === 'requests' && (
                  <th className="delivery-requests">Requests</th>
                )}
                <th className="order-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                return (
                  <tr key={order._id} className="order-row-clickable">
                    <td 
                      className="clickable-cell order-id" 
                      onClick={() => viewOrderDetails(order)}
                      data-debug="order-id"
                    >
                      #{order._id.slice(-6)}
                    </td>
                    <td 
                      className="clickable-cell customer-info" 
                      onClick={() => viewOrderDetails(order)}
                      data-debug="customer-info"
                    >
                      <div>
                        <strong>{order.user?.name || 'N/A'}</strong>
                        <span>{order.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    {userRole !== 'admin' || activeTab !== 'requests' ? (
                      <>
                        <td 
                          className="clickable-cell order-items" 
                          onClick={() => viewOrderDetails(order)}
                          data-debug="order-items"
                        >
                          <span>{order.items?.length || 0} items</span>
                        </td>
                        <td 
                          className="clickable-cell order-total" 
                          onClick={() => viewOrderDetails(order)}
                          data-debug="order-total"
                        >
                          <strong>₱{order.total?.toFixed(2) || '0.00'}</strong>
                        </td>
                        <td 
                          className="clickable-cell order-status" 
                          onClick={() => viewOrderDetails(order)}
                          data-debug="order-status"
                        >
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </>
                    ) : null}
                    <td 
                      className="clickable-cell order-date" 
                      onClick={() => viewOrderDetails(order)}
                      data-debug="order-date"
                    >
                      {formatDate(order.createdAt)}
                    </td>
                    {userRole === 'admin' && activeTab === 'requests' && (
                      <td className="delivery-requests">
                        <span className="requests-count">
                          <FiUser /> {getDeliveryRequestsCount(order)}
                        </span>
                      </td>
                    )}
                    <td className="order-actions" data-debug="actions" onClick={(e) => e.stopPropagation()}>
                      {renderOrderActions(order)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <p><strong>Order ID:</strong> #{selectedOrder._id.slice(-6)}</p>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  {selectedOrder.assignedDeliveryBoy && (
                    <p><strong>Assigned Delivery:</strong> {selectedOrder.assignedDeliveryBoy.name}</p>
                  )}

                </div>

                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.user?.phone || 'N/A'}</p>
                </div>

                <div className="detail-section">
                  <h3>Delivery Address</h3>
                  {selectedOrder.deliveryAddress ? (
                    <div className="delivery-address-details">
                      <p><strong>Full Name:</strong> {selectedOrder.deliveryAddress.fullName || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedOrder.deliveryAddress.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedOrder.deliveryAddress.phone || 'N/A'}</p>
                      {selectedOrder.deliveryAddress.street && (
                        <p><strong>Street:</strong> {selectedOrder.deliveryAddress.street}</p>
                      )}
                      {selectedOrder.deliveryAddress.city && (
                        <p><strong>City:</strong> {selectedOrder.deliveryAddress.city}</p>
                      )}
                      {selectedOrder.deliveryAddress.state && (
                        <p><strong>State:</strong> {selectedOrder.deliveryAddress.state}</p>
                      )}
                      {selectedOrder.deliveryAddress.zipCode && (
                        <p><strong>ZIP Code:</strong> {selectedOrder.deliveryAddress.zipCode}</p>
                      )}
                      {selectedOrder.deliveryAddress.country && (
                        <p><strong>Country:</strong> {selectedOrder.deliveryAddress.country}</p>
                      )}
                    </div>
                  ) : (
                    <p>No address provided</p>
                  )}
                </div>

                {selectedOrder.note && (
                  <div className="detail-section">
                    <h3>Order Note</h3>
                    <p className="order-note">{selectedOrder.note}</p>
                  </div>
                )}

                {selectedOrder.deliveryRequests && selectedOrder.deliveryRequests.length > 0 && (
                  <div className="detail-section">
                    <h3>Delivery Requests</h3>
                    <div className="delivery-requests-list">
                      {selectedOrder.deliveryRequests.map((request, index) => (
                        <div key={index} className="delivery-request-item">
                          <p><strong>Delivery Person:</strong> {request.deliveryBoyId.name}</p>
                          <p><strong>Requested:</strong> {formatDate(request.requestedAt)}</p>
                          <p><strong>Status:</strong> 
                            <span className={`request-status ${request.status}`}>
                              {request.status.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Order Items</h3>
                  <div className="order-items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <strong>{item.product?.name || 'Product'}</strong>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="item-price">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="payment-summary">
                    <p><strong>Subtotal:</strong> ₱{selectedOrder.subtotal?.toFixed(2) || '0.00'}</p>
                    <p><strong>Delivery Fee:</strong> ₱{selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</p>
                    <p><strong>Tax:</strong> ₱{selectedOrder.tax?.toFixed(2) || '0.00'}</p>
                    <p className="total"><strong>Total:</strong> ₱{selectedOrder.total?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 