import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiShoppingCart, FiStar, FiPlus, FiMinus, FiFileText } from 'react-icons/fi';
import { useCustomer } from '../contexts/CustomerContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../style/CustomerProducts.css';

const CustomerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addToCart, getTotalItems } = useCustomer();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/products/customer');
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="customer-products">
      <div className="products-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Shop Products</h1>
            <p>Discover amazing products at great prices</p>
          </div>
          <div className="header-actions">
            <Link to="/customer-orders" className="action-btn orders-btn">
              <FiFileText />
              <span>View Orders</span>
            </Link>
            <Link to="/customer-cart" className="action-btn cart-btn">
              <FiShoppingCart />
              <span>View Cart ({getTotalItems()})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found. Try adjusting your search or category filter.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                {product.stock === 0 && (
                  <div className="out-of-stock">Out of Stock</div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-rating">
                  <FiStar className="star-icon" />
                  <span>{product.rating || 0} ({product.numReviews || 0} reviews)</span>
                </div>
                
                <div className="product-price">
                  <span className="current-price">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">${product.originalPrice}</span>
                  )}
                </div>
                
                <div className="product-stock">
                  <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock-text'}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className="add-to-cart-btn"
                >
                  <FiShoppingCart />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerProducts; 