import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import argon2 from "argon2";
import { createHash } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../src/models/User.js";

test("password recovery integration workflow", async (t) => {
  const envKeys = [
    "CLIENT_ORIGIN",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
    "PASSWORD_RESET_URL",
  ];

  const originalEnv = Object.fromEntries(
    envKeys.map((key) => [key, process.env[key]]),
  );

  let mongo;

  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.JWT_SECRET = "teecraft-password-reset-integration-secret-".repeat(
    2,
  );
  process.env.JWT_EXPIRES_IN = "1h";

  // Deliberately leave SMTP unconfigured.
  for (const key of [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "SMTP_FROM",
    "PASSWORD_RESET_URL",
  ]) {
    delete process.env[key];
  }

  try {
    const { default: app } = await import("../src/app.js");

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri("teecraft_password_reset_test"));

    const origin = "http://localhost:5173";
    const email = "password-reset@example.com";
    const oldPassword = "Old-Integration-Password-123!";
    const newPassword = "New-Integration-Password-456!";

    const passwordHash = await argon2.hash(oldPassword, {
      type: argon2.argon2id,
    });

    const user = await User.create({
      name: "Password Reset Customer",
      email,
      passwordHash,
    });

    const hashToken = (token) =>
      createHash("sha256").update(token).digest("hex");

    await t.test(
      "returns the same generic response for known and unknown emails",
      async () => {
        const knownResponse = await request(app)
          .post("/api/auth/forgot-password")
          .set("Origin", origin)
          .send({ email });

        const unknownResponse = await request(app)
          .post("/api/auth/forgot-password")
          .set("Origin", origin)
          .send({ email: "unknown@example.com" });

        assert.equal(knownResponse.status, 200);
        assert.equal(unknownResponse.status, 200);

        assert.deepEqual(knownResponse.body, unknownResponse.body);

        assert.equal(knownResponse.body.success, true);
        assert.equal("token" in knownResponse.body, false);

        const storedUser = await User.findById(user._id).select(
          "+passwordResetTokenHash +passwordResetExpiresAt",
        );

        // Failed email delivery must not leave an unusable token.
        assert.equal(storedUser.passwordResetTokenHash, undefined);
        assert.equal(storedUser.passwordResetExpiresAt, undefined);
      },
    );

    const expiredToken = "a".repeat(64);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetTokenHash: hashToken(expiredToken),
          passwordResetExpiresAt: new Date(Date.now() - 60_000),
        },
      },
    );

    await t.test("rejects an expired reset token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .set("Origin", origin)
        .send({
          token: expiredToken,
          password: newPassword,
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);

      const unchangedUser = await User.findById(user._id).select(
        "+passwordHash",
      );

      assert.equal(
        await argon2.verify(unchangedUser.passwordHash, oldPassword),
        true,
      );
    });

    const validToken = "b".repeat(64);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetTokenHash: hashToken(validToken),
          passwordResetExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      },
    );

    let copiedAccessToken;

    await t.test(
      "successful password reset changes the password and revokes existing sessions",
      async () => {
        const client = request.agent(app);

        const loginResponse = await client
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({
            email,
            password: oldPassword,
          });

        assert.equal(loginResponse.status, 200);

        const cookies = loginResponse.headers["set-cookie"] ?? [];
        const accessCookie = cookies.find((cookie) =>
          cookie.startsWith("teecraft_access="),
        );

        assert.ok(accessCookie, "Login should issue an access cookie");

        copiedAccessToken = accessCookie.split(";")[0];

        const resetResponse = await request(app)
          .post("/api/auth/reset-password")
          .set("Origin", origin)
          .send({
            token: validToken,
            password: newPassword,
          });

        assert.equal(resetResponse.status, 200);
        assert.equal(resetResponse.body.success, true);

        const storedUser = await User.findById(user._id).select(
          "+passwordHash +passwordResetTokenHash +passwordResetExpiresAt",
        );

        assert.equal(
          await argon2.verify(storedUser.passwordHash, newPassword),
          true,
        );

        assert.equal(storedUser.tokenVersion, 1);
        assert.equal(storedUser.passwordResetTokenHash, undefined);
        assert.equal(storedUser.passwordResetExpiresAt, undefined);

        const oldSessionResponse = await request(app)
          .get("/api/auth/me")
          .set("Cookie", copiedAccessToken);

        assert.equal(oldSessionResponse.status, 401);

        const oldPasswordResponse = await request(app)
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({
            email,
            password: oldPassword,
          });

        assert.equal(oldPasswordResponse.status, 401);

        const newPasswordResponse = await request(app)
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({
            email,
            password: newPassword,
          });

        assert.equal(newPasswordResponse.status, 200);
      },
    );

    await t.test("rejects reuse of a consumed reset token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .set("Origin", origin)
        .send({
          token: validToken,
          password: "Another-Password-789!",
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });

    await t.test("rejects malformed reset tokens", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .set("Origin", origin)
        .send({
          token: "invalid-token",
          password: newPassword,
        });

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
