import { useState, useEffect } from 'react';
import PageHeader from '../components/Layout/PageHeader';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import adminService from '../services/adminService';
import '../pages/Dashboard.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, isActive) => {
        try {
            await adminService.toggleUserStatus(userId, isActive);
            alert(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
            loadUsers();
        } catch (err) {
            alert('Error updating user status');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <PageHeader title="User Management" subtitle="Manage all platform users" />

            <div className="data-table">
                <div className="table-header">
                    <h2>All Users</h2>
                    <Button onClick={loadUsers}>
                        <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '18px' }}>
                            refresh
                        </span> Refresh
                    </Button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.full_name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone_number}</td>
                                <td>{user.roles.join(', ')}</td>
                                <td>
                                    <Badge status={user.is_active ? 'active' : 'inactive'} />
                                </td>
                                <td>
                                    {user.is_active ? (
                                        <Button
                                            variant="warning"
                                            onClick={() => handleToggleStatus(user._id, false)}
                                        >
                                            Deactivate
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="success"
                                            onClick={() => handleToggleStatus(user._id, true)}
                                        >
                                            Activate
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
