import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';
import { CATEGORY_SPECIFICATIONS } from '../utils/productSpecifications';
import './AdminProducts.css';

// Category and Brand mapping
const CATEGORY_BRAND_MAP = {
  'TV': ['Samsung', 'LG', 'Sony', 'TCL', 'Panasonic', 'OnePlus','VU CALIFORNIA'],
  'Washing Machine': ['Samsung', 'LG', 'Whirlpool'],
  'Fridge': ['Samsung', 'LG', 'Whirlpool', 'Godrej'],
  'Microwave Oven': ['Samsung', 'LG', 'Godrej', 'IFB', 'Bosch'],
  'AC': ['LG', 'Samsung', 'Whirlpool'],
  'Table Fan': ['Usha', 'Bajaj', 'Crompton', 'Havells'],
  'Air Cooler': ['Symphony', 'Bajaj', 'Crompton', 'Havells', 'Orient', 'Kenstar', 'Orient Electric', 'Blue Star']
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
    descriptionPoints: [],
    price: '',
    category: '',
    brand: '',
    stock: '',
    warranty: '',
    specifications: {}
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [stockError, setStockError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [warrantyError, setWarrantyError] = useState('');
  const [nameError, setNameError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [brandError, setBrandError] = useState('');
  const [specErrors, setSpecErrors] = useState({});

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
      // Reset brand and specifications when category changes
      setForm(prev => ({ ...prev, [name]: value, brand: '', specifications: {} }));
      setSpecErrors({});
    } else if (name === 'stock') {
      // Validate stock in real-time
      const stockValue = parseInt(value, 10);
      if (value && (isNaN(stockValue) || stockValue < 0)) {
        setStockError('Stock cannot be negative');
      } else {
        setStockError('');
      }
      setForm(prev => ({ ...prev, [name]: value }));
    } else if (name === 'price') {
      // Validate price in real-time
      const priceValue = parseFloat(value);
      if (value && (isNaN(priceValue) || priceValue <= 0)) {
        setPriceError('Price must be greater than 0');
      } else {
        setPriceError('');
      }
      setForm(prev => ({ ...prev, [name]: value }));
    } else if (name === 'warranty') {
      // Validate warranty in real-time
      const warrantyValue = parseInt(value, 10);
      if (value && (isNaN(warrantyValue) || warrantyValue < 0 || warrantyValue > 10)) {
        setWarrantyError('Warranty must be between 0 and 10 years');
      } else {
        setWarrantyError('');
      }
      setForm(prev => ({ ...prev, [name]: value }));
    } else if (name === 'name') {
      setNameError(value.trim() ? '' : 'Product name is required');
      setForm(prev => ({ ...prev, [name]: value }));
    } else if (name === 'category') {
      setCategoryError(value ? '' : 'Category is required');
      setForm(prev => ({ ...prev, [name]: value, brand: '', specifications: {} }));
      setSpecErrors({});
      setBrandError('');
    } else if (name === 'brand') {
      setBrandError(value ? '' : 'Brand is required');
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecificationChange = (specName, value) => {
    setForm(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [specName]: value
      }
    }));

    // Real-time validation
    const specsConfig = CATEGORY_SPECIFICATIONS[form.category];
    if (specsConfig) {
      const spec = specsConfig.find(s => s.name === specName);
      if (spec) {
        if (spec.required && (value === undefined || value === '')) {
          setSpecErrors(prev => ({ ...prev, [specName]: `${specName} is required` }));
        } else if (value !== undefined && value !== '') {
          if (spec.type === 'number') {
            const numVal = parseFloat(value);
            if (spec.min !== undefined && numVal < spec.min) {
              setSpecErrors(prev => ({ ...prev, [specName]: `${specName} must be at least ${spec.min}` }));
            } else if (spec.max !== undefined && numVal > spec.max) {
              setSpecErrors(prev => ({ ...prev, [specName]: `${specName} cannot exceed ${spec.max}` }));
            } else {
              // Valid
              setSpecErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[specName];
                return newErrors;
              });
            }
          } else if (spec.type === 'dropdown' && spec.values && !spec.values.includes(value)) {
            setSpecErrors(prev => ({ ...prev, [specName]: `Invalid value for ${specName}` }));
          } else if (spec.type === 'boolean' && typeof value !== 'boolean') {
            setSpecErrors(prev => ({ ...prev, [specName]: `Invalid value for ${specName}` }));
          } else {
             // Valid dropdown/boolean
             setSpecErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[specName];
                return newErrors;
             });
          }
        } else {
           // Value is empty but not required
           setSpecErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[specName];
              return newErrors;
           });
        }
      }
    }
  };

  const handleAddDescriptionPoint = () => {
    setForm(prev => ({
      ...prev,
      descriptionPoints: [...prev.descriptionPoints, '']
    }));
  };

  const handleRemoveDescriptionPoint = (index) => {
    setForm(prev => ({
      ...prev,
      descriptionPoints: prev.descriptionPoints.filter((_, i) => i !== index)
    }));
  };

  const handleDescriptionPointChange = (index, value) => {
    setForm(prev => {
      const newPoints = [...prev.descriptionPoints];
      newPoints[index] = value;
      return { ...prev, descriptionPoints: newPoints };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSpecErrors({});
    let hasError = false;
    
    // Validate required fields
    if (!form.name?.trim()) {
      setNameError('Product name is required');
      hasError = true;
    } else {
      setNameError('');
    }

    if (form.price === '' || parseFloat(form.price) <= 0) {
      setPriceError('Price must be greater than 0');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (!form.category) {
      setCategoryError('Category is required');
      hasError = true;
    } else {
      setCategoryError('');
    }

    if (!form.brand) {
      setBrandError('Brand is required');
      hasError = true;
    } else {
      setBrandError('');
    }

    if (form.stock === '' || parseInt(form.stock, 10) < 0) {
      setStockError('Stock cannot be negative');
      hasError = true;
    } else {
      setStockError('');
    }

    if (form.warranty === '' || parseInt(form.warranty, 10) < 0 || parseInt(form.warranty, 10) > 10) {
      setWarrantyError('Warranty must be between 0 and 10 years');
      hasError = true;
    } else {
      setWarrantyError('');
    }

    if (hasError) {
      setError('❌ Please fix the validation errors below');
      setTimeout(() => setError(''), 5000);
    }

    // Validate dynamic specifications
    const specsConfig = CATEGORY_SPECIFICATIONS[form.category];
    const newSpecErrors = {};
    if (specsConfig) {
      for (const spec of specsConfig) {
        if (spec.dependsOn) {
          const depValue = form.specifications[spec.dependsOn.field];
          if (depValue !== spec.dependsOn.value) continue;
        }

        let value = form.specifications[spec.name];

        // For boolean specs, treat undefined as false for required validation
        if (spec.type === 'boolean' && value === undefined) {
          value = false;
        }
        
        if (spec.required && (value === undefined || value === '')) {
          newSpecErrors[spec.name] = `${spec.name} is required`;
          hasError = true;
          continue;
        }

        if (value !== undefined && value !== '') {
          if (spec.type === 'number') {
            const numVal = parseFloat(value);
            if (spec.min !== undefined && numVal < spec.min) {
               newSpecErrors[spec.name] = `${spec.name} must be at least ${spec.min}`;
               hasError = true;
            } else if (spec.max !== undefined && numVal > spec.max) {
               newSpecErrors[spec.name] = `${spec.name} cannot exceed ${spec.max}`;
               hasError = true;
            }
          } else if (spec.type === 'dropdown' && spec.values && !spec.values.includes(value)) {
             newSpecErrors[spec.name] = `Invalid value for ${spec.name}`;
             hasError = true;
          } else if (spec.type === 'boolean' && typeof value !== 'boolean') {
             newSpecErrors[spec.name] = `Invalid value for ${spec.name}`;
             hasError = true;
          }
        }
      }
    }

    if (hasError) {
      setSpecErrors(newSpecErrors);
      setError('❌ Please fix the validation errors below');
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

      const descriptionText = form.descriptionPoints.filter(p => p.trim()).join(' -> ');
      
      if (imageFile) {
        data = new FormData();
        data.append('name', form.name);
        data.append('description', descriptionText);
        data.append('price', form.price);
        data.append('category', form.category);
        data.append('brand', form.brand);
        data.append('stock', form.stock);
        data.append('warranty', form.warranty);
        if (Object.keys(form.specifications).length > 0) {
          data.append('specifications', JSON.stringify(form.specifications));
        }
        data.append('image', imageFile);
      } else {
        // For edits without new image
        data = {
          name: form.name,
          description: descriptionText,
          price: form.price,
          category: form.category,
          brand: form.brand,
          stock: form.stock,
          warranty: form.warranty,
          specifications: form.specifications
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
        descriptionPoints: [],
        price: '',
        category: '',
        brand: '',
        stock: '',
        warranty: '',
        specifications: {}
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
    const points = product.description ? product.description.split(' -> ').map(p => p.trim()) : [];
    setForm({
      name: product.name,
      description: product.description || '',
      descriptionPoints: points,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      warranty: product.warranty !== undefined ? product.warranty : '',
      specifications: product.specifications || {}
    });
    setSpecErrors({});
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
      descriptionPoints: [],
      price: '',
      category: '',
      brand: '',
      stock: '',
      warranty: '',
      specifications: {}
    });
    setSpecErrors({});
    setImageFile(null);
    setError('');
    setStockError('');
    setPriceError('');
    setWarrantyError('');
    setNameError('');
    setCategoryError('');
    setBrandError('');
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
        <h1>Products Management</h1>
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
                <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
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
                    className={nameError ? 'input-error' : ''}
                  />
                  {nameError && <span className="validation-error">{nameError}</span>}
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
                      className={priceError ? 'input-error' : ''}
                      min="0"
                      step="0.01"
                      required
                    />
                    {priceError && <span className="validation-error">{priceError}</span>}
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="0"
                      value={form.stock}
                      onChange={handleChange}
                      className={stockError ? 'input-error' : ''}
                      min="0"
                      required
                    />
                    {stockError && <span className="validation-error">{stockError}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Warranty (Years) *</label>
                    <input
                      type="number"
                      name="warranty"
                      placeholder="e.g., 1"
                      value={form.warranty}
                      onChange={handleChange}
                      className={warrantyError ? 'input-error' : ''}
                      min="0"
                      max="10"
                      required
                    />
                    {warrantyError && <span className="validation-error">{warrantyError}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={categoryError ? 'input-error' : ''}
                    >
                      <option value="">Select Category</option>
                      {Object.keys(CATEGORY_BRAND_MAP).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {categoryError && <span className="validation-error">{categoryError}</span>}
                  </div>

                  <div className="form-group">
                    <label>Brand * {!form.category && <span className="hint">(Select category first)</span>}</label>
                    <select
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      className={brandError ? 'input-error' : ''}
                      disabled={!form.category}
                    >
                      <option value="">Select Brand</option>
                      {availableBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                    {brandError && <span className="validation-error">{brandError}</span>}
                  </div>
                </div>

                {/* Dynamic Specifications */}
                {CATEGORY_SPECIFICATIONS[form.category] && (
                  <div className="dynamic-specifications" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#2c3e50', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>Technical Specifications</h3>
                    <div className="form-row" style={{ flexWrap: 'wrap' }}>
                      {CATEGORY_SPECIFICATIONS[form.category].map((spec, index) => {
                        // Check dependencies
                        if (spec.dependsOn) {
                          const depValue = form.specifications[spec.dependsOn.field];
                          if (depValue !== spec.dependsOn.value) return null;
                        }

                        return (
                          <div key={index} className="form-group" style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
                            <label>
                              {spec.name} {spec.required && '*'} 
                              {spec.unit && <span className="hint">({spec.unit})</span>}
                            </label>
                            
                            {spec.type === 'dropdown' ? (
                              <>
                                <select
                                  value={form.specifications[spec.name] || ''}
                                  onChange={(e) => handleSpecificationChange(spec.name, e.target.value)}
                                  required={spec.required}
                                  className={specErrors[spec.name] ? 'input-error' : ''}
                                >
                                  <option value="">Select {spec.name}</option>
                                  {spec.values.map(val => (
                                    <option key={val} value={val}>{val}</option>
                                  ))}
                                </select>
                                {specErrors[spec.name] && <span className="validation-error">{specErrors[spec.name]}</span>}
                              </>
                            ) : spec.type === 'boolean' ? (
                              <div className="toggle-switch-container" style={{ marginTop: '0.25rem' }}>
                                <label className="switch">
                                  <input
                                    type="checkbox"
                                    checked={form.specifications[spec.name] || false}
                                    onChange={(e) => handleSpecificationChange(spec.name, e.target.checked)}
                                  />
                                  <span className="slider round"></span>
                                </label>
                                <span style={{ marginLeft: '10px', fontWeight: '500', color: form.specifications[spec.name] ? '#4CAF50' : '#666' }}>
                                  {form.specifications[spec.name] ? 'Yes' : 'No'}
                                </span>
                              </div>
                            ) : (
                              <>
                                <input
                                  type={spec.type === 'number' ? 'number' : 'text'}
                                  placeholder={`Enter ${spec.name}`}
                                  value={form.specifications[spec.name] || ''}
                                  onChange={(e) => handleSpecificationChange(spec.name, spec.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                  min={spec.min}
                                  max={spec.max}
                                  required={spec.required}
                                  className={specErrors[spec.name] ? 'input-error' : ''}
                                />
                                {specErrors[spec.name] && <span className="validation-error">{specErrors[spec.name]}</span>}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Description Points</label>
                  <div className="description-points-container">
                    {form.descriptionPoints.map((point, index) => (
                      <div key={index} className="description-point-row">
                        <span className="point-number">{index + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Enter description point ${index + 1}`}
                          value={point}
                          onChange={(e) => handleDescriptionPointChange(index, e.target.value)}
                          className="description-point-input"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDescriptionPoint(index)}
                          className="remove-point-btn"
                          title="Remove this point"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddDescriptionPoint}
                      className="add-point-btn"
                    >
                      + Add Point
                    </button>
                  </div>
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
                      <span className="upload-icon"></span>
                      <span>Click to upload or drag & drop</span>
                      <span className="file-hint">JPG, PNG, or WebP (max 5MB)</span>
                    </label>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-btn">
                    {editingId ? 'Update Product' : 'Add Product'}
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
            placeholder="Search products by name or category..."
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
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
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
                      <span className="status-visible">Visible</span>
                    ) : (
                      <span className="status-hidden">Hidden</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className={`action-btn visibility-btn ${product.visible ? 'hide' : 'show'}`}
                        onClick={() => handleToggleVisibility(product._id, product.visible)}
                        title={product.visible ? 'Hide product' : 'Show product'}
                      >
                        {product.visible ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(product)}
                        title="Edit product"
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(product._id)}
                        title="Delete product"
                      >
                        Delete
                      </button>
                    </div>
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
