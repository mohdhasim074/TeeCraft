
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { api } from "../services/api";
import "../styles/auth-pages.css";

const RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/i;

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token") || "";
    const isTokenValid = RESET_TOKEN_PATTERN.test(token);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!isTokenValid) {
            setError(
                "This password-reset link is invalid. Request a new one."
            );
            return;
        }

        if (password.length < 12 || password.length > 128) {
            setError("Your password must be between 12 and 128 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post("/auth/reset-password", {
                token,
                password,
            });

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Your password has been reset successfully. " +
                        "You can now log in with your new password.",
                },
            });
        } catch (requestError) {
            setError(
                requestError.message ||
                "Unable to reset your password. " +
                "The link may have expired. Request a new one."
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
                    <h1>Reset your password</h1>
                    <p>
                        Choose a new password for your TeeCraft account.
                    </p>
                </div>

                {!isTokenValid && (
                    <div className="auth-message auth-message--error" role="alert">
                        This password-reset link is missing or invalid.
                        Request a new reset link to continue.
                    </div>
                )}

                {error && (
                    <div className="auth-message auth-message--error" role="alert">
                        {error}
                    </div>
                )}

                {isTokenValid && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <label htmlFor="reset-password">
                                New password
                            </label>

                            <input
                                id="reset-password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your new password"
                                minLength={12}
                                maxLength={128}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="reset-confirm-password">
                                Confirm new password
                            </label>

                            <input
                                id="reset-confirm-password"
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                placeholder="Enter your new password again"
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
                            {isSubmitting
                                ? "Resetting password..."
                                : "Reset password"}
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    <Link to="/forgot-password">
                        Request a new reset link
                    </Link>
                </p>

                <p className="auth-footer">
                    <Link to="/login">Back to login</Link>
                </p>
            </section>
        </main>
    );
}
