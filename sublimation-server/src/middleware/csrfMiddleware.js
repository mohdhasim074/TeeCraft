import { timingSafeEqual } from "node:crypto";

export const allowedOrigins = new Set(
  (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireTrustedOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("Origin");

  if (!origin || !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not permitted.",
    });
  }

  return next();
}

export function requireCsrf(req, res, next) {
  const csrfToken = req.get("X-CSRF-Token");
  const signedCsrfToken = req.auth?.csrf;

  if (
    typeof csrfToken !== "string" ||
    typeof signedCsrfToken !== "string" ||
    !/^[a-f\d]{64}$/i.test(csrfToken) ||
    !/^[a-f\d]{64}$/i.test(signedCsrfToken)
  ) {
    return res.status(403).json({
      success: false,
      message: "A valid CSRF token is required.",
    });
  }

  const provided = Buffer.from(csrfToken, "hex");
  const expected = Buffer.from(signedCsrfToken, "hex");

  if (!timingSafeEqual(provided, expected)) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token.",
    });
  }

  return next();
}
