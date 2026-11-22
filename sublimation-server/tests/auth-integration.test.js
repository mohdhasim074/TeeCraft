import User, { ACCOUNT_STATUSES } from "../src/models/User.js";
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

test("customer authentication integration workflow", async (t) => {
  const originalEnv = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  };

  let mongo;

  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.JWT_SECRET = "teecraft-integration-test-secret-".repeat(3);
  process.env.JWT_EXPIRES_IN = "1h";

  try {
    // Import after setting CLIENT_ORIGIN because the CSRF middleware
    // reads the allowed origins when its module is loaded.
    const { default: app } = await import("../src/app.js");

    // Use an isolated in-memory database, never the configured database.
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri("teecraft_auth_test"));

    const client = request.agent(app);
    let copiedAccessToken;
    const origin = "http://localhost:5173";
    const email = "integration-customer@example.com";
    const password = "Integration-Test-Password-123!";

    await t.test("registers a customer and normalizes the email", async () => {
      const response = await client
        .post("/api/auth/register")
        .set("Origin", origin)
        .send({
          name: "  Integration Customer  ",
          email: "  Integration-Customer@Example.com  ",
          password,
        });

      assert.equal(response.status, 201);
      assert.equal(response.body.success, true);
      assert.equal(response.body.user.name, "Integration Customer");
      assert.equal(response.body.user.email, email);
      assert.equal(response.body.user.role, "customer");
      assert.equal(response.body.user.status, "active");
      assert.equal("passwordHash" in response.body.user, false);
    });

    await t.test(
      "prevents public registration from assigning the Developer role",
      async () => {
        const response = await client
          .post("/api/auth/register")
          .set("Origin", origin)
          .send({
            name: "Developer Registration Attempt",
            email: "developer-attempt@example.com",
            password,
            role: "developer",
          });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.user.role, "customer");
      },
    );

    await t.test("rejects duplicate email registration", async () => {
      const response = await client
        .post("/api/auth/register")
        .set("Origin", origin)
        .send({
          name: "Another Customer",
          email,
          password,
        });

      assert.equal(response.status, 409);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects an incorrect password", async () => {
      const response = await client
        .post("/api/auth/login")
        .set("Origin", origin)
        .send({
          email,
          password: "Definitely-Wrong-Password-123!",
        });

      assert.equal(response.status, 401);
      assert.equal(response.body.success, false);
      assert.equal(response.headers["set-cookie"], undefined);
    });
    // inactive

    await t.test("rejects login for an inactive account", async () => {
      await User.updateOne(
        { email },
        { $set: { status: ACCOUNT_STATUSES.INACTIVE } },
      );

      try {
        const response = await request(app)
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({ email, password });

        assert.equal(response.status, 403);
        assert.equal(response.body.success, false);
        assert.equal(response.body.message, "This account is not active.");
        assert.equal(response.headers["set-cookie"], undefined);
      } finally {
        await User.updateOne(
          { email },
          { $set: { status: ACCOUNT_STATUSES.ACTIVE } },
        );
      }
    });

    await t.test("rejects login for a suspended account", async () => {
      await User.updateOne(
        { email },
        { $set: { status: ACCOUNT_STATUSES.SUSPENDED } },
      );

      try {
        const response = await request(app)
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({ email, password });

        assert.equal(response.status, 403);
        assert.equal(response.body.success, false);
        assert.equal(response.body.message, "This account is not active.");
        assert.equal(response.headers["set-cookie"], undefined);
      } finally {
        await User.updateOne(
          { email },
          { $set: { status: ACCOUNT_STATUSES.ACTIVE } },
        );
      }
    });

    await t.test(
      "logs in and issues a secure cookie configuration",
      async () => {
        const response = await client
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({ email, password });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.user.email, email);

        const cookies = response.headers["set-cookie"] ?? [];
        const accessCookie = cookies.find((cookie) =>
          cookie.startsWith("teecraft_access="),
        );

        //

        assert.ok(accessCookie, "Authentication cookie should be issued");
        assert.match(accessCookie, /HttpOnly/i);
        assert.match(accessCookie, /SameSite=Strict/i);
        assert.match(accessCookie, /Path=\/api/i);

        // Verify that the cookie lifetime matches the configured JWT lifetime.
        const maxAgeMatch = accessCookie.match(/(?:^|;\s*)Max-Age=(\d+)/i);
        assert.ok(maxAgeMatch, "Authentication cookie should have a Max-Age");

        const cookieLifetimeSeconds = Number(maxAgeMatch[1]);
        const jwtToken = accessCookie
          .slice("teecraft_access=".length)
          .split(";")[0];
        copiedAccessToken = jwtToken;
        const jwtPayload = jwt.decode(jwtToken);
        assert.ok(jwtPayload, "Authentication JWT should be decodable");
        assert.equal(typeof jwtPayload.iat, "number");
        assert.equal(typeof jwtPayload.exp, "number");

        assert.equal(
          jwtPayload.exp - jwtPayload.iat,
          cookieLifetimeSeconds,
          "JWT expiration should match the cookie lifetime",
        );

        assert.equal("passwordHash" in response.body.user, false);

        //
        assert.equal("passwordHash" in response.body.user, false);
      },
    );

    await t.test("returns the authenticated customer profile", async () => {
      const response = await client.get("/api/auth/me");

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.user.email, email);
      assert.equal(response.body.user.role, "customer");
      assert.equal("passwordHash" in response.body.user, false);
    });

    let csrfToken;

    await t.test(
      "returns a CSRF token for the authenticated session",
      async () => {
        const response = await client.get("/api/auth/csrf");

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.match(response.body.csrfToken, /^[a-f\d]{64}$/i);

        csrfToken = response.body.csrfToken;
      },
    );

    await t.test("rejects profile updates without authentication", async () => {
      const response = await request(app)
        .patch("/api/auth/me")
        .set("Origin", origin)
        .send({ name: "Unauthenticated Update" });

      assert.equal(response.status, 401);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects profile updates without a CSRF token", async () => {
      const response = await client
        .patch("/api/auth/me")
        .set("Origin", origin)
        .send({ name: "Missing CSRF Token" });

      assert.equal(response.status, 403);
      assert.equal(response.body.success, false);
    });

    await t.test(
      "updates the authenticated customer's name and persists it",
      async () => {
        const response = await client
          .patch("/api/auth/me")
          .set("Origin", origin)
          .set("X-CSRF-Token", csrfToken)
          .send({ name: "  Updated Integration Customer  " });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.message, "Profile updated successfully.");
        assert.equal(response.body.user.name, "Updated Integration Customer");
        assert.equal(response.body.user.email, email);
        assert.equal(response.body.user.role, "customer");
        assert.equal("passwordHash" in response.body.user, false);

        const savedUser = await User.findOne({ email });

        assert.ok(savedUser);
        assert.equal(savedUser.name, "Updated Integration Customer");
        assert.equal(savedUser.email, email);
        assert.equal(savedUser.role, "customer");
      },
    );

    await t.test("rejects unsupported profile fields", async () => {
      const response = await client
        .patch("/api/auth/me")
        .set("Origin", origin)
        .set("X-CSRF-Token", csrfToken)
        .send({
          name: "Unauthorized Role Change",
          role: "admin",
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.equal(
        response.body.message,
        "Only the name field can be updated.",
      );

      const savedUser = await User.findOne({ email });

      assert.equal(savedUser.name, "Updated Integration Customer");
      assert.equal(savedUser.role, "customer");
    });

    await t.test("rejects invalid profile names", async () => {
      const response = await client
        .patch("/api/auth/me")
        .set("Origin", origin)
        .set("X-CSRF-Token", csrfToken)
        .send({ name: "   " });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.equal(
        response.body.message,
        "Name must contain between 2 and 100 characters.",
      );

      const savedUser = await User.findOne({ email });

      assert.equal(savedUser.name, "Updated Integration Customer");
    });

    await t.test("rejects logout with an invalid CSRF token", async () => {
      const response = await client
        .post("/api/auth/logout")
        .set("Origin", origin)
        .set("X-CSRF-Token", "0".repeat(64));

      assert.equal(response.status, 403);
      assert.equal(response.body.success, false);

      // The session should remain authenticated after rejected logout.
      const profile = await client.get("/api/auth/me");
      assert.equal(profile.status, 200);
    });

    await t.test("logs out and invalidates the browser session", async () => {
      const response = await client
        .post("/api/auth/logout")
        .set("Origin", origin)
        .set("X-CSRF-Token", csrfToken);

      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.message, "Logged out successfully.");
      const copiedTokenResponse = await request(app)
        .get("/api/auth/me")
        .set("Cookie", `teecraft_access=${copiedAccessToken}`);

      assert.equal(copiedTokenResponse.status, 401);
      assert.equal(copiedTokenResponse.body.success, false);

      const profile = await client.get("/api/auth/me");

      assert.equal(profile.status, 401);
      assert.equal(profile.body.success, false);
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
