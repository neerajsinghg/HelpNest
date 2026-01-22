import { useState, useEffect } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import adminService from '../services/adminService';
import '../pages/Dashboard.css';

const Providers = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        try {
            setLoading(true);
            const usersData = await adminService.getUsers();
            const providerUsers = usersData.filter((u) =>
                u.roles.includes('provider')
            );
            setProviders(providerUsers);
        } catch (err) {
            console.error('Error loading providers:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader
                title="Service Providers"
                subtitle="Manage service provider profiles"
            />

            <div className="data-table">
                <div className="table-header">
                    <h2>All Providers</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Provider</th>
                            <th>Services</th>
                            <th>Rating</th>
                            <th>Jobs Completed</th>
                            <th>Earnings</th>
                            <th>KYC Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    No providers found
                                </td>
                            </tr>
                        ) : (
                            providers.map((provider) => (
                                <tr key={provider._id}>
                                    <td>{provider.full_name}</td>
                                    <td>N/A</td>
                                    <td>N/A</td>
                                    <td>0</td>
                                    <td>₹0</td>
                                    <td>
                                        <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                                            Approved
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Providers;
