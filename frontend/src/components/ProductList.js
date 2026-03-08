import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    search: '',
    sort: ''
  });


  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.brand && filters.brand !== 'all') params.brand = filters.brand;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;
      if (user?.role === 'admin') params.admin = true;

      const response = await getProducts(params);
      const data = response.data.products || [];
      const unique = Array.from(new Map(data.map(p => [p._id, p])).values());
      setProducts(unique);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };  




  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      // Reset brand when category changes
      setFilters(prev => ({
        ...prev,
        [name]: value,
        brand: ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Get available brands based on selected category
  const availableBrands = {
    'Grinder': ['Preethi', 'Philips', 'Havells', 'Butterfly', 'Bajaj'],
    'TV': ['Samsung', 'LG', 'Sony', 'TCL', 'Panasonic', 'OnePlus'],
    'Washing Machine': ['Samsung', 'LG', 'IFB', 'Bosch', 'Whirlpool', 'Godrej'],
    'Fridge': ['Samsung', 'LG', 'Whirlpool', 'Godrej', 'Haier', 'Voltas'],
    'Fan': ['Havells', 'Usha', 'Philips', 'Bajaj', 'Orient', 'Crompton'],
    'Microwave': ['Samsung', 'LG', 'Godrej', 'IFB', 'Bosch']
  }[filters.category] || [];

  const handleImageError = (e) => {
    // Fallback image if the original fails to load
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    // If image starts with http, it's already a full URL
    if (image.startsWith('http')) return image;
    // Otherwise, construct full backend URL
    return `http://localhost:5000${image}`;
  };

  return (
    <div className="product-list">
      <div className="filters">
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All Categories</option>
          <option value="Grinder">🔧 Grinder</option>
          <option value="TV">📺 TV</option>
          <option value="Washing Machine">🧺 Washing Machine</option>
          <option value="Fridge">❄️ Fridge</option>
          <option value="Fan">🌀 Fan</option>
          <option value="Microwave">🍳 Microwave</option>
        </select>
        <select name="brand" value={filters.brand} onChange={handleFilterChange} disabled={!filters.category}>
          <option value="">All Brands</option>
          {availableBrands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          <option value="">Sort By</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Best Rating</option>
        </select>
      </div>

      {loading ? (
        <div>Loading products...</div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <div 
                key={product._id || product.id} 
                className="product-card" 
                style={{opacity: 1, borderColor: '#ddd', borderWidth: '1px', position: 'relative', cursor: 'pointer'}}
                onClick={() => navigate(`/product/${product._id || product.id}`)}
              >
                {!product.visible && <div style={{position: 'absolute', top: '10px', left: '10px', backgroundColor: '#ff9900', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 2}}>OUT OF STOCK</div>}
                <img 
                  src={getImageUrl(product.image?.trim() || product.thumbnail)} 
                  alt={product.name || product.title}
                  onError={handleImageError}
                  className={product.visible ? '' : 'dimmed'}
                  style={{width: '100%', height: '200px', objectFit: 'cover', display: 'block'}}
                />
                <h3>
                  {product.name || product.title}
                </h3>
                <p className="price">₹{product.price || 0}</p>
                {product.stock !== undefined && (
                  <p className={`stock-label ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                )}
                <p className="description">{(product.description || '').substring(0, 50)}...</p>
                <div className="rating">⭐ {typeof product.rating === 'object' ? product.rating?.rate || 'N/A' : product.rating || 'N/A'}</div>
                <button 
                  className="view-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${product._id || product.id}`);
                  }}
                  disabled={product.stock !== undefined && product.stock <= 0}
                >
                  {product.stock !== undefined && product.stock <= 0 ? 'Unavailable' : 'View Details'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;
