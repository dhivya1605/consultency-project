import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RatingModal = ({ orderId, productId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
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
        productId, // Correctly pass the productId
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert(`Failed to submit rating: ${error.response?.data?.message || error.message}`); // Display detailed error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rate Your Experience</h2>
        
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${star <= rating ? 'active' : ''}`}
              onClick={() => setRating(star)}
            >
              ⭐
            </span>
          ))}
        </div>

        <textarea
          placeholder="Share your feedback (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit Rating'}
          </button>
          <button onClick={onClose} className="cancel-btn">Skip</button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;