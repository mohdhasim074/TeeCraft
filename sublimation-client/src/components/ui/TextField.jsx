
function TextField({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder = "",
    helpText,
    error,
    required = false,
    autoComplete,
    disabled = false,
}) {
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;

    const describedBy = [
        helpText ? helpId : null,
        error ? errorId : null,
    ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
        <div className="ui-field">
            <label className="ui-label" htmlFor={id}>
                {label}
                {required && (
                    <span aria-hidden="true"> *</span>
                )}
            </label>

            <input
                id={id}
                name={id}
                className={`ui-input${error ? " ui-input--error" : ""}`}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
            />

            {helpText && (
                <p className="ui-help" id={helpId}>
                    {helpText}
                </p>
            )}

            {error && (
                <p className="ui-error" id={errorId}>
                    {error}
                </p>
            )}
        </div>
    );
}

export default TextField;
