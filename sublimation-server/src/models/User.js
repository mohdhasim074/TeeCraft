import mongoose from "mongoose";
// roles
export const USER_ROLES = Object.freeze({
  CUSTOMER: "customer",
  STAFF: "staff",
  ADMIN: "admin",
  DEVELOPER: "developer",
});

export const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUSES),
      default: ACCOUNT_STATUSES.ACTIVE,
      required: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
      default: undefined,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: undefined,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

// Database-level protection against duplicate email addresses.
userSchema.index({ email: 1 }, { unique: true });

// Do not expose the password hash when serializing a user.
userSchema.set("toJSON", {
  transform(_document, result) {
    delete result.passwordHash;
    return result;
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
