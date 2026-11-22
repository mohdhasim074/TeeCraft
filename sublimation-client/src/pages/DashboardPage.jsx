
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import {api} from "../services/api";
import "../components/dashboard/dashboard-profile.css";

function ProfileEditor({ user, refreshUser }) {
    const [name, setName] = useState(user?.name || "");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function handleCancel() {
        setName(user?.name || "");
        setIsEditing(false);
        setMessage("");
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        const normalizedName = name.trim();

        if (normalizedName.length < 2 || normalizedName.length > 100) {
            setError("Name must contain between 2 and 100 characters.");
            return;
        }

        try {
            setIsSaving(true);

            const csrfResponse = await api.get("/auth/csrf");
            const csrfToken = csrfResponse?.csrfToken;

            if (
                typeof csrfToken !== "string" ||
                !/^[a-f0-9]{64}$/i.test(csrfToken)
            ) {
                throw new Error("Unable to verify your session. Please try again.");
            }

            await api.patch(
                "/auth/me",
                { name: normalizedName },
                {
                    headers: {
                        "X-CSRF-Token": csrfToken,
                    },
                },
            );

            await refreshUser();

            setName(normalizedName);
            setIsEditing(false);
            setMessage("Your profile was updated successfully.");
        } catch (requestError) {
            setError(
                requestError?.message ||
                "Unable to update your profile. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="dashboard-profile-editor">
            <div className="dashboard-profile-heading">
                <div>
                    <h3>Personal information</h3>
                    <p>Manage the name displayed on your TeeCraft account.</p>
                </div>

                {!isEditing && (
                    <button
                        type="button"
                        className="profile-edit-button"
                        onClick={() => {
                            setMessage("");
                            setError("");
                            setIsEditing(true);
                        }}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {message && (
                <p className="profile-feedback profile-feedback-success" role="status">
                    {message}
                </p>
            )}

            {error && (
                <p className="profile-feedback profile-feedback-error" role="alert">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div className="profile-form-field">
                    <label htmlFor="profile-name">Full name</label>
                    <input
                        id="profile-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        maxLength={100}
                        minLength={2}
                        autoComplete="name"
                        disabled={!isEditing || isSaving}
                        required
                    />
                </div>

                <div className="profile-form-field">
                    <label htmlFor="profile-email">Email address</label>
                    <input
                        id="profile-email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        readOnly
                    />
                    <small>Email changes are not available yet.</small>
                </div>

                {isEditing && (
                    <div className="profile-form-actions">
                        <button
                            type="submit"
                            className="profile-save-button"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            className="profile-cancel-button"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default function DashboardPage() {
    const { user, refreshUser } = useAuth();

    const roleNames = {
        customer: "Customer",
        staff: "Staff",
        admin: "Administrator",
        developer: "Developer",
    };

    const roleLabel = roleNames[user?.role] || "Account";

    return (
        <section className="dashboard-welcome">
            <p className="dashboard-eyebrow">
                {roleLabel} dashboard
            </p>

            <h1>
                Welcome, {user?.name || "User"}
            </h1>

            <p className="dashboard-description">
                Your TeeCraft workspace is ready.
                More account and dashboard features will be added
                in the upcoming development steps.
            </p>

            <div className="dashboard-account-card">
                <h2>Account overview</h2>

                <dl className="dashboard-account-details">
                    <div>
                        <dt>Name</dt>
                        <dd>{user?.name || "Not available"}</dd>
                    </div>

                    <div>
                        <dt>Email</dt>
                        <dd>{user?.email || "Not available"}</dd>
                    </div>

                    <div>
                        <dt>Account role</dt>
                        <dd>{roleLabel}</dd>
                    </div>

                    <div>
                        <dt>Account status</dt>
                        <dd>{user?.status || "Not available"}</dd>
                    </div>
                </dl>

                <ProfileEditor
                    key={user?.id}
                    user={user}
                    refreshUser={refreshUser}
                />
            </div>
        </section>
    );
}
