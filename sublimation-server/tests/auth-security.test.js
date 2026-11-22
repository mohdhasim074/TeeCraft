import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../src/app.js";
import { requireCsrf } from "../src/middleware/csrfMiddleware.js";

test("GET /api/auth/me rejects a missing authentication cookie", async () => {
  const response = await request(app).get("/api/auth/me");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/auth/me rejects an invalid authentication cookie", async () => {
  const response = await request(app)
    .get("/api/auth/me")
    .set("Cookie", "teecraft_access=invalid-token");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

test("GET /api/auth/csrf rejects a missing authentication cookie", async () => {
  const response = await request(app).get("/api/auth/csrf");

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
});

function createCsrfRequest(headerToken, signedToken) {
  return {
    auth: { csrf: signedToken },
    get(name) {
      if (name.toLowerCase() === "x-csrf-token") {
        return headerToken;
      }
      return undefined;
    },
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

const validToken = "a".repeat(64);

test("CSRF middleware rejects a missing CSRF token", () => {
  const req = createCsrfRequest(undefined, validToken);
  const res = createResponse();
  let nextCalled = false;

  requireCsrf(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.equal(nextCalled, false);
});

test("CSRF middleware rejects a malformed CSRF token", () => {
  const req = createCsrfRequest("not-a-valid-token", validToken);
  const res = createResponse();
  let nextCalled = false;

  requireCsrf(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("CSRF middleware rejects a token that does not match the signed token", () => {
  const req = createCsrfRequest("b".repeat(64), validToken);
  const res = createResponse();
  let nextCalled = false;

  requireCsrf(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("CSRF middleware accepts a matching token", () => {
  const req = createCsrfRequest(validToken, validToken);
  const res = createResponse();
  let nextCalled = false;

  requireCsrf(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
});
