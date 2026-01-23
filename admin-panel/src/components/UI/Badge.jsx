import { getStatusColor } from '../../utils/formatters';
import './Badge.css';

const Badge = ({ status }) => {
    const { bg, color } = getStatusColor(status);

    return (
        <span className="badge" style={{ background: bg, color }}>
            {status}
        </span>
    );
};

export default Badge;
