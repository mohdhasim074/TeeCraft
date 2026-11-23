
import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import { useAuth } from "../context/useAuth";
import { api } from "../services/api";

import "../components/dashboard/admin-users.css";

const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
    { value: "", label: "All roles" },
    { value: "customer", label: "Customer" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Administrator" },
];

const STATUS_OPTIONS = [
    { value: "", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
];

function formatDate(value) {
    if (!value) {
        return "Never";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function formatLabel(value) {
    if (!value) {
        return "Not available";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminUsersPage() {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [searchInput, setSearchInput] = useState("");
    const [roleInput, setRoleInput] = useState("");
    const [statusInput, setStatusInput] = useState("");

    const [filters, setFilters] = useState({
        q: "",
        role: "",
        status: "",
    });

    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // The frontend check improves navigation and user experience.
    // The backend remains responsible for enforcing Admin access.


    useEffect(() => {
        if (user?.role !== "admin") {
            return undefined;
        }
        const controller = new AbortController();

        async function loadUsers() {
            setIsLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: String(page),
                limit: String(PAGE_SIZE),
            });

            if (filters.q) {
                params.set("q", filters.q);
            }

            if (filters.role) {
                params.set("role", filters.role);
            }

            if (filters.status) {
                params.set("status", filters.status);
            }

            try {
                const response = await api.get(
                    `/admin/users?${params.toString()}`,
                    { signal: controller.signal },
                );

                if (
                    response?.success !== true ||
                    !Array.isArray(response.users) ||
                    !response.pagination
                ) {
                    throw new Error(
                        "The server returned an invalid user-list response.",
                    );
                }

                setUsers(response.users);
                setPagination(response.pagination);
            } catch (requestError) {
                if (controller.signal.aborted) {
                    return;
                }

                setUsers([]);
                setPagination(null);

                if (requestError?.status === 401) {
                    setError(
                        "Your session is no longer valid. Please sign in again.",
                    );
                } else if (requestError?.status === 403) {
                    setError(
                        "You do not have permission to view user management.",
                    );
                } else {
                    setError(
                        requestError?.message ||
                        "Unable to load users. Please try again.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            controller.abort();
        };
    }, [user?.role, page, filters, refreshKey]);

    function handleFilterSubmit(event) {
        event.preventDefault();

        setPage(1);

        setFilters({
            q: searchInput.trim(),
            role: roleInput,
            status: statusInput,
        });
    }

    function handleResetFilters() {
        setSearchInput("");
        setRoleInput("");
        setStatusInput("");

        setPage(1);

        setFilters({
            q: "",
            role: "",
            status: "",
        });
    }

    function handleRetry() {
        setRefreshKey((current) => current + 1);
    }

    const totalItems = pagination?.totalItems ?? 0;
    const totalPages = Math.max(1, pagination?.totalPages ?? 0);
    //
    if (user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }
    return (
        <section className="admin-users-page">
            <div className="admin-users-heading">
                <div>
                    <p className="dashboard-eyebrow">
                        Administration
                    </p>

                    <h1>User management</h1>

                    <p className="dashboard-description">
                        View and search TeeCraft customer, staff and
                        administrator accounts.
                    </p>
                </div>

                <span className="admin-users-count">
                    {totalItems} {totalItems === 1 ? "user" : "users"}
                </span>
            </div>

            <form
                className="admin-users-filters"
                onSubmit={handleFilterSubmit}
            >
                <div className="admin-users-filter-field">
                    <label htmlFor="admin-user-search">
                        Search users
                    </label>

                    <input
                        id="admin-user-search"
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        maxLength={100}
                        placeholder="Search by name or email"
                    />
                </div>

                <div className="admin-users-filter-field">
                    <label htmlFor="admin-user-role">
                        Role
                    </label>

                    <select
                        id="admin-user-role"
                        value={roleInput}
                        onChange={(event) =>
                            setRoleInput(event.target.value)
                        }
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-users-filter-field">
                    <label htmlFor="admin-user-status">
                        Account status
                    </label>

                    <select
                        id="admin-user-status"
                        value={statusInput}
                        onChange={(event) =>
                            setStatusInput(event.target.value)
                        }
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-users-filter-actions">
                    <button type="submit">
                        Apply filters
                    </button>

                    <button
                        type="button"
                        className="admin-users-reset"
                        onClick={handleResetFilters}
                    >
                        Reset
                    </button>
                </div>
            </form>

            {error && (
                <div
                    className="admin-users-error"
                    role="alert"
                >
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={handleRetry}
                    >
                        Try again
                    </button>
                </div>
            )}

            {isLoading ? (
                <div
                    className="admin-users-state"
                    role="status"
                    aria-live="polite"
                >
                    Loading user accounts...
                </div>
            ) : !error && users.length === 0 ? (
                <div className="admin-users-state">
                    No user accounts found.
                </div>
            ) : !error ? (
                <>
                    <div className="admin-users-table-wrapper">
                        <table className="admin-users-table">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Registered</th>
                                    <th scope="col">Last login</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((account) => (
                                    <tr key={account._id}>
                                        <td data-label="Name">
                                            {account.name}
                                        </td>

                                        <td data-label="Email">
                                            {account.email}
                                        </td>

                                        <td data-label="Role">
                                            {formatLabel(account.role)}
                                        </td>

                                        <td data-label="Status">
                                            <span
                                                className={`admin-users-status status-${account.status}`}
                                            >
                                                {formatLabel(account.status)}
                                            </span>
                                        </td>

                                        <td data-label="Registered">
                                            {formatDate(account.createdAt)}
                                        </td>

                                        <td data-label="Last login">
                                            {formatDate(account.lastLoginAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="admin-users-pagination">
                        <p>
                            Page {page} of {totalPages}
                        </p>

                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                                disabled={page <= 1 || isLoading}
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage((current) =>
                                        Math.min(totalPages, current + 1),
                                    )
                                }
                                disabled={
                                    page >= totalPages ||
                                    isLoading ||
                                    users.length === 0
                                }
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
}
