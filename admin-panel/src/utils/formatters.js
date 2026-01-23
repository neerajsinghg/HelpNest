export const formatCurrency = (amount) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const truncateId = (id, length = 6) => {
    if (!id) return 'N/A';
    return `#${id.slice(-length)}`;
};

export const getStatusColor = (status) => {
    const colors = {
        pending: { bg: '#fff3e0', color: '#f57c00' },
        approved: { bg: '#e8f5e9', color: '#2e7d32' },
        rejected: { bg: '#ffebee', color: '#c62828' },
        active: { bg: '#e8f5e9', color: '#2e7d32' },
        inactive: { bg: '#ffebee', color: '#c62828' },
        completed: { bg: '#e8f5e9', color: '#2e7d32' },
    };
    return colors[status?.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
};
