
import { useState } from "react";
import { Link } from "react-router";

import { api } from "../services/api";
import "../styles/auth-pages.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setIsSubmitting(true);

        try {
            await api.post("/auth/forgot-password", {
                email: email.trim().toLowerCase(),
            });

            // Keep this message generic to avoid revealing
            // whether an email address has a TeeCraft account.
            setMessage(
                "If an account exists for that email address, " +
                "you will receive password-reset instructions shortly."
            );
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-heading">
                    <p className="auth-brand">TeeCraft</p>
                    <h1>Forgot your password?</h1>
                    <p>
                        Enter the email address associated with your
                        account. If an account exists, we will send
                        password-reset instructions.
                    </p>
                </div>

                {message && (
                    <div
                        className="auth-message auth-message--success"
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        className="auth-message auth-message--error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="forgot-email">
                            Email address
                        </label>

                        <input
                            id="forgot-email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            maxLength={254}
                            required
                        />
                    </div>

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Sending..."
                            : "Send reset instructions"}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your password?{" "}
                    <Link to="/login">Back to login</Link>
                </p>
            </section>
        </main>
    );
}
