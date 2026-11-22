
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { api } from "../services/api";
import "../styles/auth-pages.css";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        if (password.length < 12 || password.length > 128) {
            setError("Password must contain between 12 and 128 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    message: "Your customer account has been created. You can now log in.",
                },
            });
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to create your account. Please try again."
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
                    <h1>Create your account</h1>
                    <p>Register to explore custom printing and design services.</p>
                </div>

                {error && (
                    <div className="auth-message auth-message--error" role="alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="register-name">Full name</label>
                        <input
                            id="register-name"
                            type="text"
                            name="name"
                            autoComplete="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Your full name"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="register-email">Email address</label>
                        <input
                            id="register-email"
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
                        <label htmlFor="register-password">Password</label>
                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="At least 12 characters"
                            minLength={12}
                            maxLength={128}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="confirm-password">Confirm password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Enter your password again"
                            minLength={12}
                            maxLength={128}
                            required
                        />
                    </div>

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    );
}
