import './StatCard.css';

const StatCard = ({ title, value, icon, iconColor, bgColor }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span className="stat-card-title">{title}</span>
                <div className="stat-card-icon" style={{ background: bgColor }}>
                    <span className="material-icons" style={{ color: iconColor }}>
                        {icon}
                    </span>
                </div>
            </div>
            <div className="stat-card-value">{value}</div>
        </div>
    );
};

export default StatCard;
