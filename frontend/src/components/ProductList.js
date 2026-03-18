import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Carousel from './Carousel';

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
    'TV': ['Samsung', 'LG', 'Sony', 'TCL', 'Panasonic', 'OnePlus'],
    'Washing Machine': ['Samsung', 'LG', 'Whirlpool'],
    'Fridge': ['Samsung', 'LG', 'Whirlpool', 'Godrej'],
    'Microwave Oven': ['Samsung', 'LG', 'Godrej', 'IFB', 'Bosch'],
    'AC': ['LG', 'Samsung', 'Whirlpool'],
    'Table Fan': ['Usha', 'Bajaj', 'Crompton', 'Havells'],
    'Air Cooler': ['Symphony', 'Bajaj', 'Crompton', 'Havells', 'Orient', 'Kenstar', 'Orient Electric', 'Blue Star']
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
    <>
      {!user && <Carousel />}
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
          <option value="TV">📺 TV</option>
          <option value="Washing Machine">🧺 Washing Machine</option>
          <option value="Fridge">❄️ Fridge</option>
          <option value="Microwave Oven">🍳 Microwave Oven</option>
          <option value="AC">❄️ AC</option>
          <option value="Table Fan">🌀 Table Fan</option>
          <option value="Air Cooler">🌬️ Air Cooler</option>
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
                className="product-card minimal-card" 
                onClick={() => navigate(`/product/${product._id || product.id}`)}
              >
                {!product.visible && <div className="out-of-stock-badge">OUT OF STOCK</div>}
                <div className="product-image-container">
                  <img 
                    src={getImageUrl(product.image?.trim() || product.thumbnail)} 
                    alt={product.name || product.title}
                    onError={handleImageError}
                    className={product.visible ? '' : 'dimmed'}
                  />
                </div>
                <div className="product-info-minimal">
                  <h3 className="product-title-minimal">
                    {product.name || product.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default ProductList;
