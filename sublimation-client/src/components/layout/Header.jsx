
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import { useAuth } from "../../context/useAuth";
import { api } from "../../services/api";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const { user, status, refreshUser } = useAuth();
    const navigate = useNavigate();

    function closeMenu() {
        setMenuOpen(false);
    }

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

            closeMenu();

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
        <>
            <a className="skip-link" href="#main-content">
                Skip to main content
            </a>

            <header className="site-header">
                <div className="container header-inner">
                    <Link
                        className="brand"
                        to="/"
                        aria-label="TeeCraft homepage"
                        onClick={closeMenu}
                    >
                        <span className="brand-mark" aria-hidden="true">
                            T
                        </span>

                        <span className="brand-name">TeeCraft</span>
                    </Link>

                    <button
                        className="menu-toggle"
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="primary-navigation"
                        onClick={() => setMenuOpen((current) => !current)}
                    >
                        {menuOpen ? "Close" : "Menu"}
                    </button>

                    <nav
                        id="primary-navigation"
                        className={`navigation ${menuOpen ? "navigation-open" : ""}`}
                        aria-label="Primary navigation"
                    >
                        <NavLink to="/" end onClick={closeMenu}>
                            Home
                        </NavLink>

                        <a href="/#categories" onClick={closeMenu}>
                            Explore
                        </a>

                        <a href="/#about" onClick={closeMenu}>
                            About
                        </a>

                        {user ? (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    onClick={closeMenu}
                                >
                                    My Dashboard
                                </NavLink>

                                <button
                                    className="navigation-logout"
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut
                                        ? "Logging out..."
                                        : "Logout"}
                                </button>
                            </>
                        ) : status !== "loading" ? (
                            <>
                                <NavLink to="/login" onClick={closeMenu}>
                                    Login
                                </NavLink>

                                <NavLink to="/register" onClick={closeMenu}>
                                    Register
                                </NavLink>
                            </>
                        ) : null}
                    </nav>
                </div>

                {logoutError && (
                    <div className="container" role="alert">
                        <p className="header-logout-error">
                            {logoutError}
                        </p>
                    </div>
                )}
            </header>
        </>
    );
}

export default Header;
