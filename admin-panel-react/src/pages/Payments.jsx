import { useState, useEffect } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import StatCard from '../components/UI/StatCard';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import adminService from '../services/adminService';
import { formatDate, truncateId } from '../utils/formatters';
import '../pages/Dashboard.css';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const [paymentsData, analyticsData] = await Promise.all([
                adminService.getPayments(),
                adminService.getPaymentAnalytics(),
            ]);
            setPayments(paymentsData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Error loading payments:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader title="Payment Tracking" subtitle="Monitor all transactions" />

            <div className="stats-grid">
                <StatCard
                    title="Total Payments"
                    value={analytics.total_payments}
                    icon="payment"
                    iconColor="#1976d2"
                    bgColor="#e3f2fd"
                />
                {Object.entries(analytics.by_payment_method).map(([method, count]) => (
                    <StatCard
                        key={method}
                        title={method.toUpperCase()}
                        value={count}
                        icon="payment"
                        iconColor="#4caf50"
                        bgColor="#e8f5e9"
                    />
                ))}
            </div>

            <div className="data-table">
                <div className="table-header">
                    <h2>All Payments</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Job ID</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.slice(0, 20).map((payment) => (
                            <tr key={payment._id}>
                                <td>{payment.transaction_id || 'N/A'}</td>
                                <td>{truncateId(payment.job_id)}</td>
                                <td>₹{payment.amount}</td>
                                <td>{payment.payment_method.toUpperCase()}</td>
                                <td>
                                    <Badge status={payment.status} />
                                </td>
                                <td>{formatDate(payment.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
