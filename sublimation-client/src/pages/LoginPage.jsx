
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { useAuth } from "../context/useAuth";
import { api } from "../services/api";
import "../styles/auth-pages.css";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const registrationMessage = location.state?.message;

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password,
            });

            await refreshUser();

            navigate("/", { replace: true });
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to log in. Please check your details and try again."
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
                    <h1>Welcome back</h1>
                    <p>Log in to access your TeeCraft account.</p>
                </div>

                {registrationMessage && (
                    <div className="auth-message auth-message--success" role="status">
                        {registrationMessage}
                    </div>
                )}

                {error && (
                    <div className="auth-message auth-message--error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
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

                    <div className="auth-field">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="auth-form-links">
                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create an account</Link>
                </p>
            </section>
        </main>
    );
}
