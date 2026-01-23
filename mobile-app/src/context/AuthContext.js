
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

  const login = async (phone, password) => {
    setIsLoading(true);
    try {
      console.log('Attempting login to:', `${API_URL}/auth/token`);
      console.log('Phone:', phone);

      const response = await axios.post(`${API_URL}/auth/token`,
        `username=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`,
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
      alert(`Login failed: ${e.response?.data?.detail || e.message}`);
      setIsLoading(false);
      return { success: false };
    }
  };

  // userData: { phone_number, password, full_name, dob, address, roles, current_role, category (opt), profile_picture_url (opt) }
  const register = async (userData) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration to:', `${API_URL}/auth/register`);

      const payload = {
        phone_number: userData.phone_number,
        password: userData.password,
        full_name: userData.full_name,
        dob: userData.dob,
        roles: userData.roles,
        current_role: userData.current_role,
        address: userData.address,
      };

      if (userData.category) {
        payload.category = userData.category;
      }
      if (userData.profile_picture_url) {
        payload.profile_picture_url = userData.profile_picture_url;
      }

      console.log('Register Payload:', payload);

      await axios.post(`${API_URL}/auth/register`, payload);

      console.log('Registration successful, logging in...');
      const loginResult = await login(userData.phone_number, userData.password);
      return loginResult;
    } catch (e) {
      console.log('Register error:', e);
      console.log('Error response:', e.response?.data);
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

  const updateProfile = async (userData) => {
    if (!userToken) return { success: false };
    setIsLoading(true);
    try {
      console.log('Updating profile:', userData);
      const response = await axios.put(`${API_URL}/users/me`, userData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setUserInfo(response.data);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      console.log('Update profile error', e);
      alert(`Update failed: ${e.response?.data?.detail || e.message}`);
      setIsLoading(false);
      return { success: false };
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
    <AuthContext.Provider value={{ login, logout, register, switchRole, updateProfile, userToken, userInfo, isLoading }}>
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
