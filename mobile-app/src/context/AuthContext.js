
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Replace with your machine's local IP
export const API_URL = 'http://192.168.0.136:8000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUserInfo = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(response.data);
      return response.data;
    } catch (e) {
      console.log('Get user info error', e);
      return null;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      console.log('Attempting login to:', `${API_URL}/auth/token`);
      console.log('Email:', email);

      const response = await axios.post(`${API_URL}/auth/token`,
        `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      console.log('Login response:', response.data);
      const token = response.data.access_token;
      setUserToken(token);
      await SecureStore.setItemAsync('userToken', token);

      // Get user info
      const user = await getUserInfo(token);

      console.log('Login successful!');
      setIsLoading(false);
      return { success: true, role: user?.current_role || 'customer' };
    } catch (e) {
      console.log('Login error:', e);
      console.log('Error response:', e.response?.data);
      console.log('Error status:', e.response?.status);
      console.log('Error message:', e.message);
      alert(`Login failed: ${e.response?.data?.detail || e.message}`);
      setIsLoading(false);
      return { success: false };
    }
  };

  const register = async (email, password, fullName, phone) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration to:', `${API_URL}/auth/register`);
      console.log('Data:', { email, full_name: fullName, phone_number: phone });

      await axios.post(`${API_URL}/auth/register`, {
        email, password, full_name: fullName, phone_number: phone
      });

      console.log('Registration successful, logging in...');
      const loginResult = await login(email, password);
      return loginResult;
    } catch (e) {
      console.log('Register error:', e);
      console.log('Error response:', e.response?.data);
      console.log('Error status:', e.response?.status);
      alert(`Registration failed: ${e.response?.data?.detail || e.message}`);
      setIsLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    setUserToken(null);
    setUserInfo(null);
    SecureStore.deleteItemAsync('userToken');
  };

  const switchRole = async (newRole) => {
    if (!userToken) return;
    try {
      const response = await axios.post(`${API_URL}/users/me/switch-role?role=${newRole}`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setUserInfo(response.data);
    } catch (e) {
      console.log('Switch role error', e);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let userToken = await SecureStore.getItemAsync('userToken');
      setUserToken(userToken);
      if (userToken) {
        await getUserInfo(userToken);
      }
      setIsLoading(false);
    } catch (e) {
      console.log('isLoggedIn error', e);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, register, switchRole, userToken, userInfo, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
