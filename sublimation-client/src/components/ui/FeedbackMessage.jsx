
function FeedbackMessage({
    // variant = "success",
    // variant = "error",
    variant = "info",
    title,
    children,
}) {
    const isError = variant === "error";

    return (
        <div
            className={`ui-feedback ui-feedback--${variant}`}
            role={isError ? "alert" : "status"}
            aria-live={isError ? "assertive" : "polite"}
        >
            {title && (
                <strong className="ui-feedback__title">
                    {title}
                </strong>
            )}

            <div>{children}</div>
        </div>
    );
}

export default FeedbackMessage;
