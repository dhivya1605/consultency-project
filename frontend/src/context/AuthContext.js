import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Verify token and get user data
      const verifyToken = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          // Token is invalid, clear it
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      };
      verifyToken();
    } else {
      setUser(null);
    }
  }, [token]);

  const register = async (name, email, password, role = 'user') => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role
      });
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
