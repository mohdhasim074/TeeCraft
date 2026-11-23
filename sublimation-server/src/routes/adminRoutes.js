import { Router } from "express";

import { listAdminUsers } from "../controllers/adminController.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";
import { USER_ROLES } from "../models/User.js";

const router = Router();

router.get(
  "/users",
  requireAuth,
  requireRole(USER_ROLES.ADMIN),
  listAdminUsers,
);

export default router;