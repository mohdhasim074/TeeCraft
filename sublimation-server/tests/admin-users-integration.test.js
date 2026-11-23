import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

import User, { ACCOUNT_STATUSES, USER_ROLES } from "../src/models/User.js";

import { generateAccessToken } from "../src/utils/token.js";

test("Admin user-list API integration", async (t) => {
  const originalEnv = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  };

  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.JWT_SECRET = "teecraft-admin-users-integration-secret-".repeat(3);
  process.env.JWT_EXPIRES_IN = "1h";

  let mongo;

  try {
    const { default: app } = await import("../src/app.js");

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri("teecraft_admin_users_test"));

    async function createAccount(
      role,
      email,
      name,
      status = ACCOUNT_STATUSES.ACTIVE,
    ) {
      const user = await User.create({
        name,
        email,
        passwordHash: "integration-test-hash",
        role,
        status,
      });

      const token = generateAccessToken(user, "a".repeat(64));

      return { user, token };
    }

    const admin = await createAccount(
      USER_ROLES.ADMIN,
      "admin-list@example.com",
      "Test Admin",
    );

    const customer = await createAccount(
      USER_ROLES.CUSTOMER,
      "customer-list@example.com",
      "Alice Customer",
    );

    await createAccount(
      USER_ROLES.STAFF,
      "staff-list@example.com",
      "Store Staff",
    );

    await createAccount(
      USER_ROLES.DEVELOPER,
      "developer-list@example.com",
      "Restricted Developer",
    );

    await createAccount(
      USER_ROLES.CUSTOMER,
      "inactive-list@example.com",
      "Inactive Customer",
      ACCOUNT_STATUSES.INACTIVE,
    );

    await t.test("rejects requests without authentication", async () => {
      const response = await request(app).get("/api/admin/users");

      assert.equal(response.status, 401);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects customer access", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `teecraft_access=${customer.token}`);

      assert.equal(response.status, 403);
      assert.equal(response.body.success, false);
    });

    await t.test("allows an Admin to list users", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.ok(Array.isArray(response.body.users));

      assert.equal(
        response.body.users.some((user) => user.role === USER_ROLES.DEVELOPER),
        false,
      );

      assert.equal(
        response.body.users.some(
          (user) => user.email === "customer-list@example.com",
        ),
        true,
      );

      assert.equal(response.body.pagination.page, 1);
      assert.equal(response.body.pagination.limit, 20);
    });

    await t.test("does not expose private account fields", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);

      for (const user of response.body.users) {
        assert.equal("passwordHash" in user, false);
        assert.equal("passwordResetTokenHash" in user, false);
        assert.equal("passwordResetExpiresAt" in user, false);
        assert.equal("tokenVersion" in user, false);
      }
    });

    await t.test("searches users by name or email", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ q: "Alice" })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.pagination.totalItems, 1);
      assert.equal(response.body.users[0].name, "Alice Customer");
    });

    await t.test("filters users by role", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ role: USER_ROLES.STAFF })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);
      assert.ok(
        response.body.users.every((user) => user.role === USER_ROLES.STAFF),
      );
    });

    await t.test("filters users by account status", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ status: ACCOUNT_STATUSES.INACTIVE })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);
      assert.ok(
        response.body.users.every(
          (user) => user.status === ACCOUNT_STATUSES.INACTIVE,
        ),
      );
    });

    await t.test("supports pagination", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ page: 1, limit: 2 })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.users.length, 2);
      assert.equal(response.body.pagination.page, 1);
      assert.equal(response.body.pagination.limit, 2);
      assert.equal(response.body.pagination.totalItems, 4);
      assert.equal(response.body.pagination.totalPages, 2);
    });

    await t.test("rejects invalid pagination values", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ page: "zero" })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects a page size greater than 100", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ limit: 101 })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects attempts to filter Developer accounts", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ role: USER_ROLES.DEVELOPER })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects unsupported query parameters", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .query({ passwordHash: "anything" })
        .set("Cookie", `teecraft_access=${admin.token}`);

      assert.equal(response.status, 400);
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
