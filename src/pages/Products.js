import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../style/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputRef = useRef(null);

  const fetchProducts = useCallback(async (search = '', page = currentPage) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products with search:', search, 'page:', page);
      const response = await api.get('/admin/products', {
        params: {
          page: page,
          limit: 10,
          search: search
        }
      });
      console.log('📦 Products fetched:', response.data.products.length, 'items');
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch products on page change, not on search term change
  useEffect(() => {
    fetchProducts(searchTerm, currentPage);
  }, [currentPage, fetchProducts]);



  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        console.log('Attempting to delete product:', productId);
        const response = await api.delete(`/admin/products/${productId}`);
        console.log('Delete response:', response.data);
        toast.success('Product deleted successfully');
        fetchProducts(searchTerm);
      } catch (error) {
        console.error('Error deleting product:', error);
        console.error('Error response:', error.response?.data);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('🔍 Search input changed:', value);
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 Search submitted:', searchTerm);
    fetchProducts(searchTerm, 1);
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products">
      <div className="products-header">
        <div className="products-title">
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <FiPlus />
          Add Product
        </Link>
      </div>

      <div className="products-filters">
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products by name, category, or brand..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
            id="product-search-input"
            autoComplete="off"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      <div className="products-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="product-image">
                    <img 
                      src={product.images[0] || '/placeholder-product.jpg'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                </td>
                <td>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <div className="price-info">
                    <span className="current-price">₱ {product.price}</span>
                    {product.originalPrice && (
                      <span className="original-price">₱ {product.originalPrice}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>{getStatusBadge(product.isActive)}</td>
                <td>
                  <div className="action-buttons">
                    <Link 
                      to={`/products/edit/${product._id}`}
                      className="btn btn-sm btn-secondary"
                      title="Edit"
                    >
                      <FiEdit />
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="btn btn-sm btn-danger"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <p>No products found</p>
            <Link to="/products/new" className="btn btn-primary">
              Add your first product
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Products; 