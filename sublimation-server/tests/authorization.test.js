import test from "node:test";
import assert from "node:assert/strict";

import User, { USER_ROLES } from "../src/models/User.js";
import { requireRole } from "../src/middleware/authMiddleware.js";

function createResponse() {
  return {
    statusCode: null,
    body: null,

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

test("each defined account role can be authorized", () => {
  for (const role of Object.values(USER_ROLES)) {
    const middleware = requireRole(role);
    const req = { user: { role } };
    const res = createResponse();
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, `${role} should be authorized`);
    assert.equal(res.statusCode, null);
  }
});

test("a customer cannot access an Admin-only route", () => {
  const middleware = requireRole(USER_ROLES.ADMIN);
  const req = { user: { role: USER_ROLES.CUSTOMER } };
  const res = createResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("a missing authenticated user receives HTTP 401", () => {
  const middleware = requireRole(USER_ROLES.DEVELOPER);
  const req = {};
  const res = createResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("requireRole rejects empty or unknown role configuration", () => {
  assert.throws(() => requireRole(), /one or more valid account roles/);

  assert.throws(
    () => requireRole("superuser"),
    /one or more valid account roles/,
  );
});

test("the User model accepts the Developer role", async () => {
  const user = new User({
    name: "Developer Account",
    email: "developer@example.com",
    passwordHash: "test-hash",
    role: USER_ROLES.DEVELOPER,
  });

  await user.validate();

  assert.equal(user.role, USER_ROLES.DEVELOPER);
});

test("the User model rejects an undefined role", async () => {
  const user = new User({
    name: "Invalid Account",
    email: "invalid@example.com",
    passwordHash: "test-hash",
    role: "superuser",
  });

  await assert.rejects(user.validate(), (error) => {
    assert.ok(error.errors.role);
    return true;
  });
});
