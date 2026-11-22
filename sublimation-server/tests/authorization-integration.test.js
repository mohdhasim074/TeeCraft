import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

import User, { ACCOUNT_STATUSES, USER_ROLES } from "../src/models/User.js";

import { requireAuth, requireRole } from "../src/middleware/authMiddleware.js";

import { generateAccessToken } from "../src/utils/token.js";

test("authentication and role authorization integration", async (t) => {
  const originalEnv = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  };

  process.env.JWT_SECRET = "teecraft-authorization-integration-secret-".repeat(
    2,
  );
  process.env.JWT_EXPIRES_IN = "1h";

  let mongo;

  try {
    mongo = await MongoMemoryServer.create();

    await mongoose.connect(mongo.getUri("teecraft_authorization_test"));

    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    // Test-only protected routes.
    app.get(
      "/test/admin",
      requireAuth,
      requireRole(USER_ROLES.ADMIN),
      (req, res) => {
        res.status(200).json({
          success: true,
          message: "Admin access granted.",
        });
      },
    );

    app.get(
      "/test/developer",
      requireAuth,
      requireRole(USER_ROLES.DEVELOPER),
      (req, res) => {
        res.status(200).json({
          success: true,
          message: "Developer access granted.",
        });
      },
    );

    async function createAccount(role, email) {
      const user = await User.create({
        name: `${role} Test Account`,
        email,
        passwordHash: "integration-test-hash",
        role,
        status: ACCOUNT_STATUSES.ACTIVE,
      });

      const token = generateAccessToken(user, "a".repeat(64));

      return { user, token };
    }

    const customer = await createAccount(
      USER_ROLES.CUSTOMER,
      "customer-authz@example.com",
    );

    const admin = await createAccount(
      USER_ROLES.ADMIN,
      "admin-authz@example.com",
    );

    const developer = await createAccount(
      USER_ROLES.DEVELOPER,
      "developer-authz@example.com",
    );

    await t.test("rejects requests without authentication", async () => {
      const response = await request(app).get("/test/admin");

      assert.equal(response.status, 401);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects customer access to Admin route", async () => {
      const response = await request(app)
        .get("/test/admin")
        .set("Cookie", `teecraft_access=${customer.token}`);

      assert.equal(response.status, 403);
      assert.equal(response.body.success, false);
    });

    await t.test("allows an Admin to access the Admin route", async () => {
      const response = await request(app)
        .get("/test/admin")
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
    });

    await t.test(
      "does not grant Admin access to Developer accounts",
      async () => {
        const response = await request(app)
          .get("/test/admin")
          .set("Cookie", `teecraft_access=${developer.token}`);

        assert.equal(response.status, 403);
        assert.equal(response.body.success, false);
      },
    );

    await t.test(
      "allows Developer access to a Developer-only route",
      async () => {
        const response = await request(app)
          .get("/test/developer")
          .set("Cookie", `teecraft_access=${developer.token}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
      },
    );

    await t.test(
      "rejects an inactive account's existing access token",
      async () => {
        const inactive = await createAccount(
          USER_ROLES.CUSTOMER,
          "inactive-authz@example.com",
        );

        await User.updateOne(
          { _id: inactive.user._id },
          { $set: { status: ACCOUNT_STATUSES.INACTIVE } },
        );

        const response = await request(app)
          .get("/test/admin")
          .set("Cookie", `teecraft_access=${inactive.token}`);

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
        assert.equal(response.body.message, "Account unavailable or inactive.");
      },
    );

    await t.test(
      "rejects a suspended account's existing access token",
      async () => {
        const suspended = await createAccount(
          USER_ROLES.CUSTOMER,
          "suspended-authz@example.com",
        );

        await User.updateOne(
          { _id: suspended.user._id },
          { $set: { status: ACCOUNT_STATUSES.SUSPENDED } },
        );

        const response = await request(app)
          .get("/test/admin")
          .set("Cookie", `teecraft_access=${suspended.token}`);

        assert.equal(response.status, 401);
        assert.equal(response.body.success, false);
        assert.equal(response.body.message, "Account unavailable or inactive.");
      },
    );

    await t.test("rejects a revoked JWT", async () => {
      await User.updateOne(
        { _id: customer.user._id },
        { $inc: { tokenVersion: 1 } },
      );

      const response = await request(app)
        .get("/test/admin")
        .set("Cookie", `teecraft_access=${customer.token}`);

      assert.equal(response.status, 401);
      assert.equal(response.body.success, false);
    });
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    if (mongo) {
      await mongo.stop();
    }

    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});
