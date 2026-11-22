import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { sendPasswordResetEmail } from "../services/passwordResetEmail.js";
import User, { USER_ROLES, ACCOUNT_STATUSES } from "../models/User.js";
import {
  generateAccessToken,
  getAccessTokenLifetimeMs,
} from "../utils/token.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerCustomer(req, res, next) {
  try {
    const { name, email, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 100 characters.",
      });
    }

    if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 12 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must contain between 12 and 128 characters.",
      });
    }

    const existingUser = await User.exists({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: USER_ROLES.CUSTOMER,
    });

    return res.status(201).json({
      success: true,
      message: "Customer account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle concurrent registration attempts for the same email.
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    next(error);
  }
}
export async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !EMAIL_PATTERN.test(normalizedEmail) ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password format.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordIsValid = await argon2.verify(user.passwordHash, password);

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.status !== ACCOUNT_STATUSES.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    // const accessToken = generateAccessToken(user);  // replaced with below lines
    const csrfToken = randomBytes(32).toString("hex");
    const accessToken = generateAccessToken(user, csrfToken);

    res.cookie("teecraft_access", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api",
      maxAge: getAccessTokenLifetimeMs(),
    });

    return res.status(200).json({
      success: true,
      message: "Login credentials verified successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
}
// password reset timelines
const PASSWORD_RESET_LIFETIME_MS = 15 * 60 * 1000;

const PASSWORD_RESET_MESSAGE =
  "If an account exists for that email, password-reset instructions will be sent.";

function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(req, res, next) {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    // Always return the same response for missing or unknown accounts.
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return res.status(200).json({
        success: true,
        message: PASSWORD_RESET_MESSAGE,
      });
    }

    const user = await User.findOne({
      email,
      status: ACCOUNT_STATUSES.ACTIVE,
    });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_LIFETIME_MS);

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: expiresAt,
          },
        },
      );

      try {
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          token,
        });
      } catch (emailError) {
        // Do not expose email delivery errors or reset tokens.
        // Remove the unusable token if delivery fails.
        await User.updateOne(
          {
            _id: user._id,
            passwordResetTokenHash: tokenHash,
          },
          {
            $unset: {
              passwordResetTokenHash: 1,
              passwordResetExpiresAt: 1,
            },
          },
        );

        console.error("Password-reset email delivery failed.");
      }
    }

    return res.status(200).json({
      success: true,
      message: PASSWORD_RESET_MESSAGE,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body ?? {};

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token, or invalid password.",
      });
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const tokenHash = hashResetToken(token);

    // Atomic update ensures that only one request can consume this token.
    const user = await User.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
        status: ACCOUNT_STATUSES.ACTIVE,
      },
      {
        $set: {
          passwordHash,
        },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
        },
        $inc: {
          tokenVersion: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token, or invalid password.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
}

// updateOwnProfile

export async function updateOwnProfile(req, res, next) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        success: false,
        message: "A valid profile update is required.",
      });
    }

    const allowedFields = ["name"];
    const submittedFields = Object.keys(body);

    if (
      submittedFields.length !== 1 ||
      submittedFields.some((field) => !allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Only the name field can be updated.",
      });
    }

    if (typeof body.name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name must be a valid string.",
      });
    }

    const normalizedName = body.name.trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 100 characters.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        status: ACCOUNT_STATUSES.ACTIVE,
      },
      {
        $set: {
          name: normalizedName,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("_id name email role status createdAt lastLoginAt");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Account not found or no longer active.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}
