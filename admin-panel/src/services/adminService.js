import api from './api';

const adminService = {
    // Analytics
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics/overview');
        return response.data;
    },

    // KYC Management
    getPendingKYC: async () => {
        const response = await api.get('/admin/kyc/pending');
        return response.data;
    },

    approveKYC: async (profileId) => {
        const response = await api.put(`/admin/kyc/${profileId}/approve`);
        return response.data;
    },

    rejectKYC: async (profileId, reason) => {
        const response = await api.put(`/admin/kyc/${profileId}/reject`, null, {
            params: { reason },
        });
        return response.data;
    },

    // User Management
    getUsers: async (role = null) => {
        const response = await api.get('/admin/users', {
            params: role ? { role } : {},
        });
        return response.data;
    },

    toggleUserStatus: async (userId, isActive) => {
        const response = await api.put(`/admin/users/${userId}/status`, null, {
            params: { is_active: isActive },
        });
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await api.get('/categories/');
        return response.data;
    },

    createCategory: async (categoryData) => {
        const response = await api.post('/categories/', categoryData);
        return response.data;
    },

    updateCategory: async (categoryId, categoryData) => {
        const response = await api.put(`/categories/${categoryId}`, categoryData);
        return response.data;
    },

    deleteCategory: async (categoryId) => {
        const response = await api.delete(`/categories/${categoryId}`);
        return response.data;
    },

    // Payments
    getPayments: async () => {
        const response = await api.get('/payments/');
        return response.data;
    },

    getPaymentAnalytics: async () => {
        const response = await api.get('/admin/analytics/payments');
        return response.data;
    },
};

export default adminService;
