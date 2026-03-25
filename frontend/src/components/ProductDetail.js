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

  const fetchProductDetail = React.useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = React.useCallback(async () => {
    try {
      const response = await apiCall.get(`/ratings/product/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  }, [id]);

  const fetchUserOrders = React.useCallback(async () => {
    try {
      await apiCall.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  }, [token]);

  React.useEffect(() => {
    fetchProductDetail();
    fetchReviews();
    if (user) {
      fetchUserOrders();
    }
  }, [fetchProductDetail, fetchReviews, fetchUserOrders, user]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    try {
      const finalPrice = product.hasOffer 
        ? product.price - (product.price * product.offerPercentage / 100) 
        : product.price;
      await addToCart(product._id, quantity, finalPrice);
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
      <button className="back-btn" onClick={() => navigate(-1)}>Back to results</button>
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
          <h1>{product.name}</h1>

          <div className="detail-rating">
            {reviews.length > 0 ? (
              <div className="rating-display">
                <span className="average-rating">{calculateOverallRating()}</span>
                <span className="rating-stars">
                  {'★'.repeat(Math.floor(calculateOverallRating()))}
                  {'☆'.repeat(5 - Math.floor(calculateOverallRating()))}
                </span>
                <span className="rating-count">{reviews.length} ratings</span>
              </div>
            ) : (
              <span className="rating-count">No ratings yet</span>
            )}
          </div>

          <div className="detail-price">
            {product.hasOffer ? (
              <div className="offer-price-container">
                <span className="original-price-detail">₹{product.price.toLocaleString('en-IN')}</span>
                <h2 className="discounted-price-detail">₹{(product.price - (product.price * product.offerPercentage / 100)).toLocaleString('en-IN')}</h2>
                <span className="offer-badge-detail">{product.offerPercentage}% OFF</span>
                <p className="savings-text">You save ₹{(product.price * product.offerPercentage / 100).toLocaleString('en-IN')}!</p>
              </div>
            ) : (
              <h2>₹{product.price?.toLocaleString('en-IN') || 0}</h2>
            )}
          </div>

          {/* Product Specifications Section */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="detail-specifications">
              <table className="specifications-table">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => {
                    // Only render if value exists and is not an empty string
                    if (value && String(value).trim() !== '') {
                      return (
                        <tr key={key}>
                          <th className="spec-key">{key}</th>
                          <td className="spec-value">{value}</td>
                        </tr>
                      );
                    }
                    return null;
                  })}
                </tbody>
              </table>
            </div>
          )}

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
