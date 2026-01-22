import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('adminToken');
        if (token) {
            setAuthToken(token);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await axios.post(
                'http://localhost:8000/api/auth/token',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const token = response.data.access_token;
            localStorage.setItem('adminToken', token);
            setAuthToken(token);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.detail || 'Invalid credentials',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAuthToken(null);
    };

    const value = {
        authToken,
        login,
        logout,
        isAuthenticated: !!authToken,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
