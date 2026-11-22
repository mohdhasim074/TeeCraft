import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";

import { useAuth } from "../../context/useAuth";
import { api } from "../../services/api";

import "./dashboard.css";

const ROLE_LABELS = {
    customer: "Customer",
    staff: "Staff",
    admin: "Administrator",
    developer: "Developer",
};

export default function DashboardLayout() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const roleLabel = ROLE_LABELS[user?.role] || "Account";

    async function handleLogout() {
        setLogoutError("");
        setIsLoggingOut(true);

        try {
            const csrfResponse = await api.get("/auth/csrf");

            if (
                typeof csrfResponse?.csrfToken !== "string" ||
                !/^[a-f\d]{64}$/i.test(csrfResponse.csrfToken)
            ) {
                throw new Error("Unable to verify the logout request.");
            }

            await api.post(
                "/auth/logout",
                {},
                {
                    headers: {
                        "X-CSRF-Token": csrfResponse.csrfToken,
                    },
                }
            );

            await refreshUser();

            navigate("/login", {
                replace: true,
                state: {
                    message: "You have been logged out successfully.",
                },
            });
        } catch (error) {
            setLogoutError(
                error.message || "Unable to log out. Please try again."
            );
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <section className="dashboard-page">
            <div className="dashboard-shell">
                <aside className="dashboard-sidebar">
                    <Link to="/" className="dashboard-brand">
                        TeeCraft
                    </Link>

                    <p className="dashboard-sidebar-label">
                        {roleLabel} workspace
                    </p>

                    <nav
                        className="dashboard-navigation"
                        aria-label="Dashboard navigation"
                    >
                        <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "dashboard-nav-link is-active"
                                    : "dashboard-nav-link"
                            }
                        >
                            Dashboard
                        </NavLink>

                        <Link to="/" className="dashboard-nav-link">
                            Visit website
                        </Link>
                    </nav>

                    <button
                        className="dashboard-logout"
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                </aside>

                <div className="dashboard-main">
                    <header className="dashboard-topbar">
                        <div>
                            <p className="dashboard-topbar-label">
                                TeeCraft workspace
                            </p>

                            <p className="dashboard-user-name">
                                {user?.name || "Account"}
                            </p>
                        </div>

                        <span className="dashboard-role">
                            {roleLabel}
                        </span>
                    </header>

                    {logoutError && (
                        <div className="dashboard-error" role="alert">
                            {logoutError}
                        </div>
                    )}

                    <main className="dashboard-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </section>
    );
}