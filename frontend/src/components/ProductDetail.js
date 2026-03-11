import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiCall } from '../utils/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchProductDetail();
    fetchReviews();
    if (user) {

      fetchUserOrders();
    }
  }, [id, user]);

  const fetchProductDetail = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiCall.get(`/ratings/product/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await apiCall.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = response.data || [];
      // setUserOrders(orders);
      
      // Check if user has ordered this product
      const hasOrderedProduct = orders.some(order =>
        order.items && order.items.some(item => item.productId === id || item.productId === parseInt(id))
      );
      // setHasOrdered(hasOrderedProduct);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      await addToCart(product._id, quantity, product.price);
      alert('✅ Product added to cart!');
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('❌ Failed to add to cart. Please try again. Error: ' + (error.message || JSON.stringify(error)));
    }
  };

  const calculateOverallRating = () => {
    if (reviews.length === 0) return 'No ratings yet';
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  if (loading) {
    return <div className="detail-loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="detail-error">Product not found</div>;
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="detail-image">
          <img 
            src={product.image?.startsWith('http') ? product.image : `http://localhost:5000${product.image}`} 
            alt={product.title}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        <div className="detail-info">
          {/* Display product name above overall rating */}
          <h1>{product.name}</h1> {/* Ensure product name is displayed even if product is null */}

          {/* Display rating as golden stars with average rating and number of members who rated */}
          <div className="detail-rating">
            {reviews.length > 0 ? (
              <div className="rating-display">
                <span className="average-rating">{calculateOverallRating()}</span>
                <span className="rating-stars">
                  {'★'.repeat(Math.floor(calculateOverallRating()))}
                  {'☆'.repeat(5 - Math.floor(calculateOverallRating()))}
                </span>
                <span className="rating-count">({reviews.length})</span>
              </div>
            ) : (
              <span>No ratings yet</span>
            )}
          </div>

          <div className="detail-price-stock">
            <h2>₹{product.price || 0}</h2>
            {product.stock !== undefined && (
              <p className={`stock-label ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            )}
          </div>

          <div className="detail-description">
            <h3>About this product</h3>
            {product.description && product.description.includes('->') ? (
              <ul className="description-list">
                {product.description.split('->').map((point, idx) => {
                  const cleanPoint = point.trim();
                  return cleanPoint ? <li key={idx}>{cleanPoint}</li> : null;
                })}
              </ul>
            ) : (
              <p>{product.description}</p>
            )}
          </div>

          <div className="detail-actions">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <input 
                type="number" 
                min="1" 
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                disabled={product.stock !== undefined && product.stock <= 0}
              />
            </div>

            {user ? (
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock !== undefined && product.stock <= 0}
              >
                {product.stock !== undefined && product.stock <= 0 ? 'Unavailable' : '🛒 Add to Cart'}
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
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews ({reviews.length})</h2>

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review, idx) => (
              <div key={idx} className="review-card">
                <div className="review-header">
                  <div className="review-author">
                    <strong>{review.userId?.name || 'Anonymous'}</strong>
                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
