import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/kyc', icon: 'verified_user', label: 'KYC Approval' },
        { path: '/users', icon: 'people', label: 'Users' },
        { path: '/providers', icon: 'handyman', label: 'Providers' },
        { path: '/categories', icon: 'category', label: 'Categories' },
        { path: '/payments', icon: 'payment', label: 'Payments' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>HelpNest</h2>
                <p>Admin Dashboard</p>
            </div>
            <div className="sidebar-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `menu-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                <div className="menu-item" onClick={logout}>
                    <span className="material-icons">logout</span>
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
