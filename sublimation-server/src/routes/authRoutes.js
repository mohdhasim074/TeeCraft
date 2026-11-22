import { Router } from "express";
import User from "../models/User.js";
import { loginRateLimiter } from "../middleware/loginRateLimiter.js";
import {
  passwordResetRequestRateLimiter,
  passwordResetSubmitRateLimiter,
} from "../middleware/passwordResetRateLimiter.js";
import {
  requestPasswordReset,
  resetPassword,
  registerCustomer,
  loginCustomer,
  updateOwnProfile,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  requireTrustedOrigin,
  requireCsrf,
} from "../middleware/csrfMiddleware.js";
const router = Router();

router.use(requireTrustedOrigin);

router.post("/register", registerCustomer);
// router.post("/login", loginCustomer);
router.post("/login", loginRateLimiter, loginCustomer);
router.post(
  "/forgot-password",
  passwordResetRequestRateLimiter,
  requestPasswordReset,
);

router.post("/reset-password", passwordResetSubmitRateLimiter, resetPassword);

router.get("/me", requireAuth, (req, res) => {
  const user = req.user;

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});
router.patch("/me", requireAuth, requireCsrf, updateOwnProfile);
//
router.get("/csrf", requireAuth, (req, res) => {
  const csrfToken = req.auth?.csrf;

  if (typeof csrfToken !== "string" || !/^[a-f\d]{64}$/i.test(csrfToken)) {
    return res.status(401).json({
      success: false,
      message: "Authentication token must be refreshed.",
    });
  }

  return res.status(200).json({
    success: true,
    csrfToken,
  });
});

// logout endpoint
router.post("/logout", requireAuth, requireCsrf, async (req, res, next) => {
  try {
    const currentTokenVersion = req.user.tokenVersion ?? 0;

    const result = await User.updateOne(
      {
        _id: req.user._id,
        $or: [
          { tokenVersion: currentTokenVersion },
          ...(currentTokenVersion === 0
            ? [{ tokenVersion: { $exists: false } }]
            : []),
        ],
      },
      {
        $inc: { tokenVersion: 1 },
      },
    );

    if (result.matchedCount !== 1) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid.",
      });
    }

    res.clearCookie("teecraft_access", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
});
export default router;
