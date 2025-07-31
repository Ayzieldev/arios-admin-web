import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiShoppingCart, FiStar, FiPlus, FiMinus, FiFileText, FiSearch, FiFilter, FiHeart, FiEye } from 'react-icons/fi';
import { useCustomer } from '../contexts/CustomerContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../style/CustomerProducts.css';

const CustomerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart, getTotalItems } = useCustomer();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/products/customer');
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

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.isActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'featured':
        default:
          return b.featured - a.featured;
      }
    });

  const categories = [...new Set(products.map(product => product.category))];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FiStar key={i} className="star-icon filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FiStar key={i} className="star-icon half-filled" />);
      } else {
        stars.push(<FiStar key={i} className="star-icon empty" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing products...</p>
      </div>
    );
  }

  return (
    <div className="customer-products">
      {/* Enhanced Header */}
      <div className="products-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Discover Amazing Products</h1>
            <p>Shop the latest trends with unbeatable prices</p>
          </div>
          <div className="header-actions">
            <Link to="/customer-orders" className="action-btn orders-btn">
              <FiFileText />
              <span>My Orders</span>
            </Link>
            <Link to="/customer-cart" className="action-btn cart-btn">
              <FiShoppingCart />
              <span>Cart ({getTotalItems()})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-content">
              <FiSearch className="no-products-icon" />
              <h3>No products found</h3>
              <p>Try adjusting your search or category filter to find what you're looking for.</p>
            </div>
          </div>
        ) : (
          filteredAndSortedProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <div className="product-image">
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                  {product.stock === 0 && (
                    <div className="out-of-stock-badge">Out of Stock</div>
                  )}
                  {product.featured && (
                    <div className="featured-badge">Featured</div>
                  )}
                </div>
                
                <div className="product-actions">
                  <button className="action-btn-wishlist" title="Add to Wishlist">
                    <FiHeart />
                  </button>
                  <button className="action-btn-quickview" title="Quick View">
                    <FiEye />
                  </button>
                </div>
              </div>
              
              <div className="product-info">
                <div className="product-brand">{product.brand || 'Arios'}</div>
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-rating">
                  <div className="stars">
                    {renderStars(product.rating || 0)}
                  </div>
                  <span className="rating-text">
                    {product.rating || 0} ({product.numReviews || 0})
                  </span>
                </div>
                
                <div className="product-price">
                  <span className="current-price">${product.price.toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="discount-badge">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
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

      {/* Results Summary */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="results-summary">
          <p>Showing {filteredAndSortedProducts.length} of {products.length} products</p>
        </div>
      )}
    </div>
  );
};

export default CustomerProducts; 