import User, { ACCOUNT_STATUSES, USER_ROLES } from "../models/User.js";
import { verifyAccessToken } from "../utils/token.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.teecraft_access;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      !/^[a-f\d]{24}$/i.test(payload.sub)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.status !== ACCOUNT_STATUSES.ACTIVE) {
      return res.status(401).json({
        success: false,
        message: "Account unavailable or inactive.",
      });
    }

    if (
      !Number.isSafeInteger(payload.tokenVersion) ||
      payload.tokenVersion < 0 ||
      payload.tokenVersion !== (user.tokenVersion ?? 0)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or revoked authentication token.",
      });
    }

    req.user = user;
    req.auth = payload;

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Restricts a route to the specified account roles.
 *
 * Always place requireAuth before requireRole:
 * router.get("/admin", requireAuth, requireRole(USER_ROLES.ADMIN), handler);
 */
export function requireRole(...allowedRoles) {
  const validRoles = new Set(Object.values(USER_ROLES));

  if (
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => !validRoles.has(role))
  ) {
    throw new Error(
      "requireRole must receive one or more valid account roles.",
    );
  }

  return function authorizeRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
}
