
function Button({
    children,
    variant = "primary",
    // variant = "secondary",
    size = "medium",
    type = "button",
    disabled = false,
    className = "",
    onClick,
}) {
    const classes = [
        "ui-button",
        `ui-button--${variant}`,
        `ui-button--${size}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default Button;
