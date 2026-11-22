import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import { loginRateLimiter } from "../src/middleware/loginRateLimiter.js";

test("login rate limiter permits five requests and rejects the sixth", async () => {
  // Isolated Express app: no database or real login controller.
  const app = express();

  app.use("/test-login", loginRateLimiter);

  app.post("/test-login", (req, res) => {
    res.status(200).json({
      success: true,
    });
  });

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await request(app).post("/test-login");

    assert.equal(
      response.status,
      200,
      `Login attempt ${attempt} should be permitted.`,
    );
  }

  const blockedResponse = await request(app).post("/test-login");

  assert.equal(blockedResponse.status, 429);
  assert.deepEqual(blockedResponse.body, {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  });
});
