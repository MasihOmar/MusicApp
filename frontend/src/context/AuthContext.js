// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services/api';

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
          // Verify if the token is still valid by making an API call
          try {
            const userData = await userService.validateToken(token);
            if (userData) {
              setUserToken(token);
              setUser(userData);
            } else {
              // Token is invalid, clear it
              await AsyncStorage.removeItem('userToken');
              setUserToken(null);
              setUser(null);
            }
          } catch (error) {
            // Token validation failed, clear token
            console.log('Token validation failed:', error);
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.log('Token loading error:', e);
        // Clear any potentially corrupted token
        await AsyncStorage.removeItem('userToken');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login işlemi
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { username, password });
      const response = await userService.login(username, password);
      console.log('Login response:', response);
      
      if (response && response.token) {
        console.log('Storing token and user data...');
        await AsyncStorage.setItem('userToken', response.token);
        // Store the user ID for future reference
        if (response.user && response.user.id) {
          await AsyncStorage.setItem('userId', response.user.id.toString());
        }
        console.log('Setting userToken and user state...');
        setUserToken(response.token);
        setUser(response.user);
        console.log('Login successful, navigation should update automatically');
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

  // Register işlemi
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await userService.register(userData);
      if (response.token) {
        await AsyncStorage.setItem('userToken', response.token);
        // Store the user ID for future reference
        if (response.user && response.user.id) {
          await AsyncStorage.setItem('userId', response.user.id.toString());
        }
        setUserToken(response.token);
        setUser(response.user);
      } else {
        throw new Error('Registration failed');
      }
    } catch (e) {
      console.log('Register error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout işlemi
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      setUserToken(null);
      setUser(null);
    } catch (e) {
      console.log('Token deletion error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook olarak kullanmak için
export const useAuth = () => useContext(AuthContext);