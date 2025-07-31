import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiUser, FiMail, FiLock, FiPhone, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../style/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      // Only allow numbers
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Limit to 11 digits (Philippine mobile number format)
      const limitedValue = numericValue.slice(0, 11);
      
      setFormData({
        ...formData,
        [name]: limitedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleKeyDown = (e) => {
    // Prevent non-numeric input for phone field
    if (e.target.name === 'phone') {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      const isNumeric = /^[0-9]$/.test(e.key);
      
      if (!isNumeric && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Validate Philippine phone number
    if (!formData.phone.startsWith('09')) {
      toast.error('Phone number must start with 09');
      return;
    }

    if (formData.phone.length !== 11) {
      toast.error('Phone number must be exactly 11 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['x-auth-token'] = token;
      
      toast.success('Registration successful! Welcome to Arios Shop!');
      
      // Redirect to customer products page
      navigate('/customer-products');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Join Arios Shop</h1>
          <p>Create your account to start shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <div className="input-icon-register">
              <FiUser />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-register">
              <FiMail />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-register">
              <FiPhone />
              <input
                type="tel"
                name="phone"
                placeholder="09XXXXXXXXX (11 digits)"
                value={formData.phone}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                className="form-input"
                maxLength="11"
              />
            </div>
            {formData.phone && formData.phone.length > 0 && (
              <small className="phone-hint">
                {formData.phone.length}/11 digits
                {!formData.phone.startsWith('09') && formData.phone.length > 0 && (
                  <span className="error-text"> - Must start with 09</span>
                )}
              </small>
            )}
          </div>

          <div className="form-group">
            <div className="input-icon-register">
              <FiLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-register">
              <FiShield />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="register-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 