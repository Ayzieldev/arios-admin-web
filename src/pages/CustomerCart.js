import React, { useState } from 'react';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiHome } from 'react-icons/fi';
import { useCustomer } from '../contexts/CustomerContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../style/CustomerCart.css';

const CustomerCart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalAmount, loading: cartLoading } = useCustomer();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity >= 1) {
      try {
        await updateQuantity(productId, newQuantity);
      } catch (error) {
        toast.error('Failed to update quantity');
      }
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cart.items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address || !customerInfo.note) {
      toast.error('Please fill in all customer information including the note');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: {
          fullName: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          street: customerInfo.address
        },
        note: customerInfo.note,
        paymentMethod: 'cash_on_delivery'
      };

              const response = await api.post('/orders', orderData);
      
      toast.success('Order placed successfully! Your order will be delivered soon.');
      await clearCart();
      setCustomerInfo({ name: '', email: '', phone: '', address: '', note: '' });
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <FiShoppingCart className="empty-cart-icon" />
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart to get started!</p>
        <Link to="/customer-products" className="view-products-btn">
          <FiHome />
          <span>View Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="customer-cart">
      <div className="cart-header">
        <div className="header-content">
          <div className="header-left">
            <h2>Shopping Cart ({cart.totalItems} items)</h2>
          </div>
          <div className="header-actions">
            <Link to="/customer-products" className="action-btn products-btn">
              <FiHome />
              <span>View Products</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="cart-container">
        <div className="cart-items">
          
          {cart.items.map((item) => (
            <div key={item.product._id} className="cart-item">
              <div className="item-image">
                <img
                  src={item.product.images[0] || '/placeholder-product.jpg'}
                  alt={item.product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              
              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p className="item-description">{item.product.description}</p>
                <p className="item-price">${item.price}</p>
              </div>
              
              <div className="item-quantity">
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                  className="quantity-btn"
                  disabled={cartLoading}
                >
                  <FiMinus />
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                  className="quantity-btn"
                  disabled={cartLoading}
                >
                  <FiPlus />
                </button>
              </div>
              
              <div className="item-total">
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              
              <button
                onClick={() => handleRemoveItem(item.product._id)}
                className="remove-btn"
                disabled={cartLoading}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="checkout-form">
          <h2>Customer Information</h2>
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Delivery Address *</label>
              <textarea
                id="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                required
                className="form-input"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="note">Order Note *</label>
              <textarea
                id="note"
                value={customerInfo.note}
                onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                required
                className="form-input"
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || cartLoading}
              className="checkout-btn"
            >
              {loading ? 'Placing Order...' : `Place Order - $${getTotalAmount().toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart; 