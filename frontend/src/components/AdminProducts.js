import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';
import './AdminProducts.css';

// Category and Brand mapping
const CATEGORY_BRAND_MAP = {
  'Grinder': ['Preethi', 'Philips', 'Havells', 'Butterfly', 'Bajaj'],
  'TV': ['Samsung', 'LG', 'Sony', 'TCL', 'Panasonic', 'OnePlus'],
  'Washing Machine': ['Samsung', 'LG', 'IFB', 'Bosch', 'Whirlpool', 'Godrej'],
  'Fridge': ['Samsung', 'LG', 'Whirlpool', 'Godrej', 'Haier', 'Voltas'],
  'Fan': ['Havells', 'Usha', 'Philips', 'Bajaj', 'Orient', 'Crompton'],
  'Microwave': ['Samsung', 'LG', 'Godrej', 'IFB', 'Bosch']
};

const AdminProducts = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, visible, hidden
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');

  // Get available brands based on selected category
  const availableBrands = form.category ? (CATEGORY_BRAND_MAP[form.category] || []) : [];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall.get('/products', {
        headers: { Authorization: `Bearer ${token}` },
        params: { admin: true }
      });
      const raw = res.data.products || [];
      const unique = Array.from(new Map(raw.map(p => [p._id, p])).values());
      setProducts(unique);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      // Reset brand when category changes
      setForm(prev => ({ ...prev, [name]: value, brand: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!form.name?.trim()) {
      setError('❌ Product name is required');
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setError('❌ Price must be greater than 0');
      return;
    }
    if (!form.category) {
      setError('❌ Category is required');
      return;
    }
    if (!form.brand) {
      setError('❌ Brand is required');
      return;
    }
    
    // Check if image is required (for new products)
    if (!editingId && !imageFile) {
      setError('❌ Please upload an image for new products');
      return;
    }

    try {
      let config = { headers: { Authorization: `Bearer ${token}` } };
      let data;

      if (imageFile) {
        data = new FormData();
        data.append('name', form.name);
        data.append('description', form.description);
        data.append('price', form.price);
        data.append('category', form.category);
        data.append('brand', form.brand);
        data.append('stock', form.stock);
        data.append('image', imageFile);
      } else {
        // For edits without new image
        data = {
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          brand: form.brand,
          stock: form.stock
        };
      }

      if (editingId) {
        await apiCall.put(`/products/${editingId}`, data, config);
        alert('✅ Product updated successfully!');
        setEditingId(null);
      } else {
        await apiCall.post('/products', data, config);
        alert('✅ Product added successfully!');
      }

      setForm({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock: ''
      });
      setImageFile(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error saving product';
      console.error('Product save error:', err);
      setError(`❌ ${errorMsg}`);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiCall.delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Product deleted!');
        fetchProducts();
      } catch (err) {
        alert('❌ Failed to delete product');
      }
    }
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      await apiCall.put(
        `/products/${id}`,
        { visible: !currentVisibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newProducts = products.map(p =>
        p._id === id ? { ...p, visible: !currentVisibility } : p
      );
      setProducts(newProducts);
      alert(currentVisibility ? '🙈 Product hidden!' : '👁 Product visible!');
    } catch (err) {
      alert('❌ Failed to update visibility');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: ''
    });
    setImageFile(null);
    setError('');
  };

  // Filter and search products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.category.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'visible') return matchesSearch && p.visible;
    if (filter === 'hidden') return matchesSearch && !p.visible;
    return matchesSearch;
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="products-header">
        <h1>📦 Products Management</h1>
        <button onClick={() => setShowForm(true)} className="add-btn">
          + Add New Product
        </button>
      </div>

      {showForm && (
        <>
          <div className="modal-backdrop" onClick={handleCancel}></div>
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingId ? '✏ Edit Product' : '➕ Add New Product'}</h2>
                <button className="modal-close" onClick={handleCancel}>✕</button>
              </div>
              
              {error && <div className="error-alert">{error}</div>}
              
              <form onSubmit={handleAdd} className="product-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="0"
                      value={form.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {Object.keys(CATEGORY_BRAND_MAP).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Brand * {!form.category && <span className="hint">(Select category first)</span>}</label>
                    <select
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      required
                      disabled={!form.category}
                    >
                      <option value="">Select Brand</option>
                      {availableBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter product description (optional)"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Product Image * {imageFile && <span className="file-name">({imageFile.name})</span>}</label>
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!editingId}
                    />
                    <label htmlFor="image-upload" className="file-upload-label">
                      <span className="upload-icon">📤</span>
                      <span>Click to upload or drag & drop</span>
                      <span className="file-hint">JPG, PNG, or WebP (max 5MB)</span>
                    </label>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-btn">
                    {editingId ? '💾 Update Product' : '✅ Add Product'}
                  </button>
                  <button type="button" onClick={handleCancel} className="cancel-btn">
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="products-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Products</option>
            <option value="visible">✅ Visible</option>
            <option value="hidden">🙈 Hidden</option>
          </select>
        </div>

        <div className="product-count">
          {filteredProducts.length} product(s)
        </div>
      </div>

      {loading ? (
        <p className="loading">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="no-products">No products found</p>
      ) : (
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} className={!product.visible ? 'hidden-row' : ''}>
                  <td className="product-name">{product.name}</td>
                  <td>{product.category}</td>
                  <td className="price">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="stock">
                    <span className={product.stock < 5 ? 'low-stock' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="status">
                    {product.visible ? (
                      <span className="status-visible">👁 Visible</span>
                    ) : (
                      <span className="status-hidden">🙈 Hidden</span>
                    )}
                  </td>
                  <td className="actions">
                    <button
                      className={`action-btn visibility-btn ${product.visible ? 'hide' : 'show'}`}
                      onClick={() => handleToggleVisibility(product._id, product.visible)}
                      title={product.visible ? 'Hide product' : 'Show product'}
                    >
                      {product.visible ? '👁 Hide' : '✅ Show'}
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(product)}
                      title="Edit product"
                    >
                      ✏ Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(product._id)}
                      title="Delete product"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
