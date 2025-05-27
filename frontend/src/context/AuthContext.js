// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  // Validate the token when app starts
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          try {
            // Try to get current user data to validate token
            const userData = await authService.getCurrentUser();
            if (userData && !userData.error) {
              setUserToken(token);
              setUser(userData);
            } else {
              // Token is invalid or expired
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userId');
              setUserToken(null);
              setUser(null);
            }
          } catch (error) {
            console.log('Token validation error:', error);
            // Clear invalid token
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
            setUserToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.log('Token loading error:', e);
        // Clear any potentially corrupted token
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
        setUserToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Refresh user data
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Login process
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email, password });
      const response = await authService.handleLogin(email, password);
      console.log('Login response:', response);
      
      if (response && response.token) {
        console.log('Login successful, token stored');
        setUserToken(response.token);
        setUser(response.user);
      } else if (response.error) {
        throw new Error(`Login failed: ${response.error}`);
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (e) {
      console.log('Login error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Register process
  const register = async (userData) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration with:', {
        email: userData.email,
        username: userData.username,
        password_present: !!userData.password_hash,
      });
      
      // Ensure all required fields are present
      if (!userData.email || !userData.username || !userData.password_hash) {
        throw new Error('Email, username and password are required');
      }
      
      const response = await authService.handleRegister(userData);
      console.log('Registration response:', {
        success: response.success,
        token_present: !!response.token,
        user_present: !!response.user,
        error: response.error
      });
      
      if (response.error) {
        throw new Error(`Registration failed: ${response.error}`);
      }
      
      if (response.token && response.user) {
        console.log('Registration successful, setting token and user');
        setUserToken(response.token);
        setUser(response.user);
      } else {
        throw new Error('Registration failed: Invalid response from server');
      }
    } catch (e) {
      console.log('Register error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout process
  const logout = async () => {
    setIsLoading(true);
    try {
      const result = await authService.handleLogout();
      setUserToken(null);
      setUser(null);
      return result;
    } catch (e) {
      console.log('Logout error:', e);
      // Still clear token on client side even if server logout fails
      setUserToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Use as a hook
export const useAuth = () => useContext(AuthContext);