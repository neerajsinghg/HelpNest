import './Button.css';

const Button = ({
    variant = 'primary',
    onClick,
    children,
    disabled = false,
    type = 'button',
    style = {}
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant}`}
            onClick={onClick}
            disabled={disabled}
            style={style}
        >
            {children}
        </button>
    );
};

export default Button;
