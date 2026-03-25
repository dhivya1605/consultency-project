import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiCall = axios.create({
  baseURL: API_URL
});

export const setAuthToken = (token) => {
  if (token) {
    apiCall.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiCall.defaults.headers.common['Authorization'];
  }
};

// Product API calls
export const getProducts = (params) => apiCall.get('/products', { params });
export const getProductById = (id) => apiCall.get(`/products/${id}`);
export const getTrendingProducts = () => apiCall.get('/products/trending');
export const searchProducts = (query, category, brand) => 
  apiCall.get('/products', { params: { search: query, category, brand } });

// Order API calls
export const createOrder = (data, token) => 
  apiCall.post('/orders', data, { headers: { Authorization: `Bearer ${token}` } });

export const getOrders = (token) => 
  apiCall.get('/orders', { headers: { Authorization: `Bearer ${token}` } });

export const processPayment = (orderId, cardDetails, token) => 
  apiCall.post('/orders/payment/process', { orderId, cardDetails }, 
    { headers: { Authorization: `Bearer ${token}` } });

// Recommendation API calls
export const getPersonalizedRecommendations = (token) =>
  apiCall.get('/recommendations/personalized', { headers: { Authorization: `Bearer ${token}` } });

export const getFrequentlyBoughtTogether = (productId) =>
  apiCall.get(`/recommendations/frequently-bought/${productId}`);

export const getRelatedProducts = (productId) =>
  apiCall.get(`/recommendations/related/${productId}`);
