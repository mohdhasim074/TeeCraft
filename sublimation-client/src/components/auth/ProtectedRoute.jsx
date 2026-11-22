import { Navigate, Outlet } from "react-router";

import { useAuth } from "../../context/useAuth";

export default function ProtectedRoute() {
    const { status, error, refreshUser } = useAuth();

    if (status === "loading") {
        return (
            <main className="dashboard-state" aria-live="polite">
                Checking your session...
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="dashboard-state" role="alert">
                <p>{error || "Unable to verify your session."}</p>

                <button type="button" onClick={() => refreshUser()}>
                    Try again
                </button>
            </main>
        );
    }

    if (status !== "authenticated") {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}