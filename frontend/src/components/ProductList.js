import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: ''
  });

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products from fakestoreapi
      const response = await fetch('https://fakestoreapi.com/products/category/electronics');
      const data = await response.json();

      // Categorize products by keywords
      const categories = [

        { name: 'washing', label: '🧺 Washing Machine', keywords: ['washing', 'machine', 'laundry'] },
        { name: 'tv', label: '📺 TV', keywords: ['television', 'tv', 'screen'] },
        { name: 'fridge', label: '🧊 Fridge', keywords: ['refrigerator', 'fridge', 'cooler'] },
        { name: 'fan', label: '🌀 Fan', keywords: ['fan', 'cooling'] },
        { name: 'light', label: '💡 Light', keywords: ['light', 'bulb', 'lighting', 'lamp'] },
        { name: 'ac', label: '❄️ AC', keywords: ['air conditioner', 'ac', 'conditioning'] },
        { name: 'microwave', label: '🔥 Microwave Oven', keywords: ['microwave', 'oven'] },
        { name: 'stabilizer', label: '⚡ Stabilizer', keywords: ['stabilizer', 'power', 'surge'] }
      ];

      let allProducts = [];

      // Categorize each product
      data.forEach(product => {
        const titleLower = product.title.toLowerCase();
        const descLower = product.description.toLowerCase();
        
        categories.forEach(category => {
          const matches = category.keywords.some(keyword => 
            titleLower.includes(keyword) || descLower.includes(keyword)
          );
          
          if (matches) {
            allProducts.push({
              ...product,
              categoryType: category.name,
              categoryLabel: category.label
            });
          }
        });
      });

      // If no products found in categories, add all products
      if (allProducts.length === 0) {
        allProducts = data.map(p => ({
          ...p,
          categoryType: 'all',
          categoryLabel: 'All Products'
        }));
      }

      // Filter by selected category
      let processedProducts = allProducts;
      if (filters.category !== '' && filters.category !== 'all') {
        processedProducts = processedProducts.filter(p => p.categoryType === filters.category);
      }

      // Filter by search
      if (filters.search) {
        processedProducts = processedProducts.filter(p => 
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Sort products
      if (filters.sort === 'price-asc') {
        processedProducts.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price-desc') {
        processedProducts.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'rating') {
        processedProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      }

      setProducts(processedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageError = (e) => {
    // Fallback image if the original fails to load
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
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
          <option value="mixer">🥣 Mixer</option>
          <option value="grinder">⚙️ Grinder</option>
          <option value="washing">🧺 Washing Machine</option>
          <option value="tv">📺 TV</option>
          <option value="fridge">🧊 Fridge</option>
          <option value="fan">🌀 Fan</option>
          <option value="light">💡 Light</option>
          <option value="ac">❄️ AC</option>
          <option value="microwave">🔥 Microwave Oven</option>
          <option value="stabilizer">⚡ Stabilizer</option>
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
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img 
                src={product.thumbnail || product.image} 
                alt={product.title}
                onError={handleImageError}
              />
              <h3>{product.title}</h3>
              <p className="price">₹{Math.round(product.price * 83)}</p>
              <p className="description">{product.description.substring(0, 50)}...</p>
              <div className="rating">⭐ {typeof product.rating === 'object' ? product.rating?.rate || 'N/A' : product.rating || 'N/A'}</div>
              <button 
                className="view-btn"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
