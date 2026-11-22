import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

import {
  passwordResetRequestRateLimiter,
  passwordResetSubmitRateLimiter,
} from "../src/middleware/passwordResetRateLimiter.js";

test("forgot-password limiter permits five requests and rejects the sixth", async () => {
  const app = express();

  app.post("/forgot-password", passwordResetRequestRateLimiter, (req, res) =>
    res.status(200).json({ success: true }),
  );

  for (let i = 0; i < 5; i += 1) {
    const response = await request(app).post("/forgot-password");
    assert.equal(response.status, 200);
  }

  const blockedResponse = await request(app).post("/forgot-password");

  assert.equal(blockedResponse.status, 429);
});

test("reset-password limiter permits five requests and rejects the sixth", async () => {
  const app = express();

  app.post("/reset-password", passwordResetSubmitRateLimiter, (req, res) =>
    res.status(200).json({ success: true }),
  );

  for (let i = 0; i < 5; i += 1) {
    const response = await request(app).post("/reset-password");
    assert.equal(response.status, 200);
  }

  const blockedResponse = await request(app).post("/reset-password");

  assert.equal(blockedResponse.status, 429);
});
