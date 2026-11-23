import User, { ACCOUNT_STATUSES, USER_ROLES } from "../models/User.js";

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const MAX_SEARCH_LENGTH = 100;

const ADMIN_VISIBLE_ROLES = [
  USER_ROLES.CUSTOMER,
  USER_ROLES.STAFF,
  USER_ROLES.ADMIN,
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isPositiveInteger(value) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value);
}

export async function listAdminUsers(req, res, next) {
  try {
    const allowedParameters = new Set(["page", "limit", "q", "role", "status"]);

    const suppliedParameters = Object.keys(req.query);

    if (suppliedParameters.some((key) => !allowedParameters.has(key))) {
      return res.status(400).json({
        success: false,
        message: "Unsupported query parameter.",
      });
    }

    const { page: pageValue, limit: limitValue, q, role, status } = req.query;

    if (
      (pageValue !== undefined && !isPositiveInteger(pageValue)) ||
      (limitValue !== undefined && !isPositiveInteger(limitValue))
    ) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers.",
      });
    }

    const page = pageValue === undefined ? 1 : Number(pageValue);
    const limit =
      limitValue === undefined ? DEFAULT_PAGE_SIZE : Number(limitValue);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      limit > MAX_PAGE_SIZE
    ) {
      return res.status(400).json({
        success: false,
        message: `Limit cannot exceed ${MAX_PAGE_SIZE}.`,
      });
    }

    if (
      q !== undefined &&
      (typeof q !== "string" || q.trim().length > MAX_SEARCH_LENGTH)
    ) {
      return res.status(400).json({
        success: false,
        message: `Search must be a string of at most ${MAX_SEARCH_LENGTH} characters.`,
      });
    }

    if (
      role !== undefined &&
      (typeof role !== "string" || !ADMIN_VISIBLE_ROLES.includes(role))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role filter.",
      });
    }

    if (
      status !== undefined &&
      (typeof status !== "string" ||
        !Object.values(ACCOUNT_STATUSES).includes(status))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status filter.",
      });
    }

    const filter = {
      role: {
        $in: ADMIN_VISIBLE_ROLES,
      },
    };

    if (role !== undefined) {
      filter.role = role;
    }

    if (status !== undefined) {
      filter.status = status;
    }

    const searchTerm = q?.trim();

    if (searchTerm) {
      const safeSearch = new RegExp(escapeRegex(searchTerm), "i");

      filter.$or = [{ name: safeSearch }, { email: safeSearch }];
    }

    const skip = (page - 1) * limit;
    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        message: "Page value is too large.",
      });
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter)
        .select("_id name email role status createdAt lastLoginAt")
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
}
