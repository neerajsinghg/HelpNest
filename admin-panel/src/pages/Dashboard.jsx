import { useState, useEffect } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import StatCard from '../components/UI/StatCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import adminService from '../services/adminService';
import { formatCurrency } from '../utils/formatters';
import './Dashboard.css';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAnalytics();
            setAnalytics(data);
        } catch (err) {
            setError('Failed to load analytics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Overview of your platform" />

            <div className="stats-grid">
                <StatCard
                    title="Total Users"
                    value={analytics.total_users}
                    icon="people"
                    iconColor="#1976d2"
                    bgColor="#e3f2fd"
                />
                <StatCard
                    title="Providers"
                    value={analytics.total_providers}
                    icon="handyman"
                    iconColor="#4caf50"
                    bgColor="#e8f5e9"
                />
                <StatCard
                    title="Total Jobs"
                    value={analytics.total_jobs}
                    icon="work"
                    iconColor="#ff9800"
                    bgColor="#fff3e0"
                />
                <StatCard
                    title="Revenue"
                    value={formatCurrency(analytics.total_revenue)}
                    icon="attach_money"
                    iconColor="#9c27b0"
                    bgColor="#f3e5f5"
                />
                <StatCard
                    title="Pending KYC"
                    value={analytics.pending_kyc}
                    icon="verified_user"
                    iconColor="#f44336"
                    bgColor="#ffebee"
                />
                <StatCard
                    title="Completed Jobs"
                    value={analytics.completed_jobs}
                    icon="check_circle"
                    iconColor="#4caf50"
                    bgColor="#e8f5e9"
                />
            </div>

            <div className="data-table">
                <div className="table-header">
                    <h2>Recent Activity</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Activity</th>
                            <th>User</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                No recent activity to display
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
