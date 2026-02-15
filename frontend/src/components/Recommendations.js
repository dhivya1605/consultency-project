import React, { useState, useEffect } from 'react';
import { getPersonalizedRecommendations, getFrequentlyBoughtTogether, getTrendingProducts } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Recommendations = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, token]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      if (productId) {
        // Get frequently bought together
        const response = await getFrequentlyBoughtTogether(productId);
        setRecommendations(response.data);
      } else if (token) {
        // Get personalized recommendations
        const response = await getPersonalizedRecommendations(token);
        setRecommendations(response.data);
      } else {
        // Get trending products
        const response = await getTrendingProducts();
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  return (
    <div className="recommendations">
      <h3>{productId ? 'Frequently Bought Together' : 'Recommended For You'}</h3>
      <div className="recommendations-grid">
        {recommendations.map(product => (
          <div key={product._id} className="recommendation-card">
            <img src={product.image} alt={product.name} />
            <h4>{product.name}</h4>
            <p>₹{product.price}</p>
            <button className="add-to-cart-btn">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
