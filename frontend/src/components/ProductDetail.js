import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      console.log('Adding to cart - Product ID:', product.id, 'Quantity:', quantity, 'Price:', product.price);
      
      // Pass product price along with the request for cart to store correct price
      const result = await addToCart(product.id, quantity, product.price);
      
      console.log('Add to cart response:', result);
      alert('Product added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again. Error: ' + (error.message || JSON.stringify(error)));
    }
  };

  if (loading) {
    return <div className="detail-loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="detail-error">Product not found</div>;
  }

  return (
    <div className="product-detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Products</button>
      
      <div className="product-detail">
        <div className="detail-image">
          <img 
            src={product.image} 
            alt={product.title}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        <div className="detail-info">
          <h1>{product.title}</h1>
          
          <div className="detail-category">
            <span className="category-badge">{product.category}</span>
          </div>

          <div className="detail-rating">
            <span className="rating-stars">
              ⭐ {typeof product.rating === 'object' ? product.rating?.rate || 'N/A' : product.rating || 'N/A'}
            </span>
            <span className="rating-count">
              ({typeof product.rating === 'object' ? product.rating?.count || 0 : 0} reviews)
            </span>
          </div>

          <div className="detail-price">
            <h2>₹{Math.round(product.price*83)}</h2>
            <p className="original-price">USD ${product.price}</p>
          </div>

          <div className="detail-description">
            <h3>About this product</h3>
            <p>{product.description}</p>
          </div>

          <div className="detail-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              />
            </div>

            {user ? (
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
            ) : (
              <div className="login-prompt">
                <p>Please login to add items to cart</p>
                <button 
                  className="login-btn"
                  onClick={() => navigate('/auth')}
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>

          <div className="detail-features">
            <h3>Product Features</h3>
            <ul>
              <li>✓ Original Product</li>
              <li>✓ Free Delivery on orders above ₹500</li>
              <li>✓ 7 Days Return Policy</li>
              <li>✓ Secure Payment</li>
              <li>✓ 24/7 Customer Support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
