import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:4002';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  // Set up axios interceptor for token
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && token) {
          // Try to refresh token
          try {
            const response = await axios.post('/api/auth/refresh');
            const newToken = response.data.accessToken;
            setToken(newToken);
            localStorage.setItem('accessToken', newToken);
            
            // Retry original request
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios.request(error.config);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Try to refresh token to validate it
          const response = await axios.post('/api/auth/refresh');
          const newToken = response.data.accessToken;
          setToken(newToken);
          localStorage.setItem('accessToken', newToken);
          
          // Decode token to get user info (simple base64 decode)
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role
          });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('accessToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { accessToken, user } = response.data;
      
      setToken(accessToken);
      setUser(user);
      localStorage.setItem('accessToken', accessToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (email, password) => {
    try {
      await axios.post('/api/auth/register', { email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send reset email' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password reset failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
