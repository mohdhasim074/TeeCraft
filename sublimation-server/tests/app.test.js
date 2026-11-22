import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";

test("GET /api/health returns HTTP 200", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: "TeeCraft API is running",
  });
});

test("unknown API routes return HTTP 404", async () => {
  const response = await request(app).get("/api/does-not-exist");

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: "API endpoint not found",
  });
});

test("login rejects an untrusted Origin", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("Origin", "https://untrusted.example")
    .send({});

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, {
    success: false,
    message: "Request origin is not permitted.",
  });
});

test("login accepts the configured development Origin before validation", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("Origin", process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .send({});

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: "Email and password are required.",
  });
});

test("CORS allows the configured development Origin", async () => {
  const origin = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")[0]
    .trim();

  const response = await request(app).get("/api/health").set("Origin", origin);

  assert.equal(response.status, 200);
  assert.equal(response.headers["access-control-allow-origin"], origin);
});
