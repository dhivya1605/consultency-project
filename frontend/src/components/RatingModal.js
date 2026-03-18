import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RatingModal = ({ orderId, productId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/ratings/submit', {
        orderId,
        productId,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmitted(true);
      // Wait 2 seconds then call the original onSubmit to close
      setTimeout(() => {
        onSubmit();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert(`${error.response?.data?.message || 'Failed to submit'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-modal-overlay">
      <div className="premium-modal-content">
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Review Product</h2>
          <p>How was your experience with this item?</p>
        </div>
        
        {submitted ? (
          <div className="rating-success-state">
            <div className="success-icon">✅</div>
            <h2>Thank You!</h2>
            <p>Your feedback helps us improve.</p>
          </div>
        ) : (
          <>
            <div className="premium-star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`premium-star ${star <= (hover || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </button>
              ))}
            </div>

            <div className="rating-desc">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>

            <div className="premium-form-group">
              <label>Share your opinion</label>
              <textarea
                placeholder="What did you like or dislike?..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="premium-textarea"
                rows={4}
              />
            </div>

            <div className="premium-modal-actions">
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="premium-submit-btn"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button onClick={onClose} className="premium-cancel-btn">Maybe Later</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RatingModal;