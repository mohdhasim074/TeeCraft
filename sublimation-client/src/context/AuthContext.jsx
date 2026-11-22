
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { api, ApiError } from "../services/api";
import AuthContext from "./AuthContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState(null);

    const refreshUser = useCallback(async ({ signal } = {}) => {
        try {
            const response = await api.get("/auth/me", { signal });

            if (
                response?.success !== true ||
                !response.user ||
                typeof response.user.id !== "string"
            ) {
                throw new ApiError(
                    "The server returned an invalid user session."
                );
            }

            setUser(response.user);
            setStatus("authenticated");
            setError(null);

            return response.user;
        } catch (requestError) {
            if (signal?.aborted) {
                return null;
            }

            setUser(null);

            if (requestError.status === 401) {
                setStatus("unauthenticated");
                setError(null);
                return null;
            }

            setStatus("error");
            setError(
                requestError.message ||
                "Unable to verify the current session."
            );

            throw requestError;
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        api.get("/auth/me", { signal: controller.signal })
            .then((response) => {
                if (controller.signal.aborted) {
                    return;
                }

                if (
                    response?.success !== true ||
                    !response.user ||
                    typeof response.user.id !== "string"
                ) {
                    throw new ApiError(
                        "The server returned an invalid user session."
                    );
                }

                setUser(response.user);
                setStatus("authenticated");
                setError(null);
            })
            .catch((requestError) => {
                if (controller.signal.aborted) {
                    return;
                }

                setUser(null);

                if (requestError.status === 401) {
                    setStatus("unauthenticated");
                    setError(null);
                    return;
                }

                setStatus("error");
                setError(
                    requestError.message ||
                    "Unable to verify the current session."
                );
            });

        return () => {
            controller.abort();
        };
    }, []);

    const value = useMemo(
        () => ({
            user,
            status,
            error,
            isLoading: status === "loading",
            isAuthenticated: status === "authenticated",
            refreshUser,
        }),
        [user, status, error, refreshUser]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
