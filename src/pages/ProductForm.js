import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../style/ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    stock: '',
    tags: '',
    isActive: true
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const categories = [
    'Fast Food', 'Beverages', 'Desserts', 'Main Course', 
    'Appetizers', 'Salads', 'Burgers', 'Pizza', 'Pasta',
    'Seafood', 'Vegetarian', 'Vegan', 'Breakfast', 'Lunch', 'Dinner'
  ];

  const brands = [
    'McDonald\'s', 'KFC', 'Burger King', 'Pizza Hut', 'Domino\'s',
    'Subway', 'Starbucks', 'Dunkin\'', 'Taco Bell', 'Wendy\'s',
    'Chick-fil-A', 'Popeyes', 'Five Guys', 'Shake Shack', 'In-N-Out'
  ];

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
              const response = await api.get(`/admin/products/${id}`);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock || '',
        tags: product.tags ? product.tags.join(', ') : '',
        isActive: product.isActive
      });
      
      setImages(product.images || []);
    } catch (error) {
      toast.error('Failed to fetch product');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      toast.error('Some files were invalid. Only images under 5MB are allowed.');
    }

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.brand) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isActive', formData.isActive);

      // Add existing images
      if (images.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(images));
      }

      // Add new image files
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      if (id) {
        await api.put(`/admin/products/${id}`, formDataToSend);
        toast.success('Product updated successfully');
      } else {
                  await api.post('/admin/products', formDataToSend);
        toast.success('Product created successfully');
      }

      navigate('/products');
    } catch (error) {
      toast.error(id ? 'Failed to update product' : 'Failed to create product');
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="product-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="product-form">
      <div className="product-form-header">
        <button 
          onClick={() => navigate('/products')}
          className="btn btn-secondary"
        >
          <FiArrowLeft />
          Back to Products
        </button>
        <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="product-form-container">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="brand" className="form-label">
                  Brand *
                </label>
                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="form-section">
            <h3>Pricing & Stock</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  Price (PHP) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="originalPrice" className="form-label">
                  Original Price (PHP)
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="form-input"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                Active Product
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>Product Images</h3>
          
          <div className="image-upload-area">
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="image-input"
            />
            <label htmlFor="images" className="image-upload-label">
              <FiUpload />
              <span>Click to upload images (max 5MB each)</span>
            </label>
          </div>

          {/* Existing Images */}
          {images.length > 0 && (
            <div className="existing-images">
              <h4>Current Images</h4>
              <div className="image-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-item">
                    <img src={image} alt={`Product ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="remove-image-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {imageFiles.length > 0 && (
            <div className="new-images">
              <h4>New Images</h4>
              <div className="image-grid">
                {imageFiles.map((file, index) => (
                  <div key={index} className="image-item">
                    <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            <FiSave />
            {saving ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 