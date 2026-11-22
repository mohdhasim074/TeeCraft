import test from "node:test";
import assert from "node:assert/strict";

import {
  errorHandler,
  notFoundHandler,
} from "../src/middleware/errorMiddleware.js";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    headersSent: false,
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

test("error handler hides internal details from clients", (t) => {
  const originalConsoleError = console.error;
  t.after(() => {
    console.error = originalConsoleError;
  });
  console.error = () => {};

  const req = { method: "GET", path: "/api/test" };
  const res = createResponse();
  const next = assert.fail;
  const err = new Error("Database password leaked");

  errorHandler(err, req, res, next);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    success: false,
    message: "Internal server error.",
  });
  assert.equal(
    JSON.stringify(res.body).includes("Database password leaked"),
    false,
  );
});

test("error handler passes errors onward if headers were already sent", () => {
  const req = { method: "GET", path: "/api/test" };
  const res = createResponse();
  res.headersSent = true;

  const err = new Error("Response already started");
  let forwardedError;

  errorHandler(err, req, res, (receivedError) => {
    forwardedError = receivedError;
  });

  assert.equal(forwardedError, err);
  assert.equal(res.body, null);
});

test("not-found handler returns the standard 404 response", () => {
  const req = {};
  const res = createResponse();

  notFoundHandler(req, res);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    success: false,
    message: "API endpoint not found",
  });
});
