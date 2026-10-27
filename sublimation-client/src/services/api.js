const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

const DEFAULT_TIMEOUT = 15000;

export class ApiError extends Error {
  constructor(message, status = null, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    ...options
  } = {},
) {
  if (!API_BASE_URL) {
    throw new ApiError("API base URL is not configured.");
  }

  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("/") ||
    endpoint.startsWith("//")
  ) {
    throw new ApiError("API endpoint must begin with a single forward slash.");
  }

  const requestHeaders = new Headers(headers);

  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  const requestBody =
    body === undefined || body === null
      ? undefined
      : body instanceof FormData
        ? body
        : JSON.stringify(body);

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  const externalSignal = options.signal;

  const abortFromExternalSignal = () => controller.abort();

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener("abort", abortFromExternalSignal, {
      once: true,
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";

    let data = null;

    if (response.status !== 204 && response.status !== 205) {
      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {
          throw new ApiError(
            "The server returned an invalid JSON response.",
            response.status,
          );
        }
      } else {
        data = await response.text();
      }
    }

    if (!response.ok) {
      const message =
        data && typeof data === "object" && typeof data.message === "string"
          ? data.message
          : `Request failed with status ${response.status}.`;

      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new ApiError(
        externalSignal?.aborted
          ? "Request was cancelled."
          : "Request timed out. Please try again.",
      );
    }

    throw new ApiError(
      "Unable to connect to the server. Please check your connection.",
    );
  } finally {
    clearTimeout(timer);

    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }
}

export const api = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: "PUT", body }),

  patch: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: "PATCH", body }),

  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};
