import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  verifyAccessToken,
  getAccessTokenLifetimeMs,
} from "../src/utils/token.js";

test("returns the correct lifetime for supported JWT durations", () => {
  withTestJwtConfig(() => {
    const cases = [
      ["1s", 1_000],
      ["15m", 900_000],
      ["1h", 3_600_000],
      ["2d", 172_800_000],
    ];

    for (const [duration, expectedMilliseconds] of cases) {
      process.env.JWT_EXPIRES_IN = duration;

      assert.equal(
        getAccessTokenLifetimeMs(),
        expectedMilliseconds,
        `Expected ${duration} to convert correctly`,
      );
    }
  });
});

test("rejects unsupported JWT duration formats", () => {
  withTestJwtConfig(() => {
    process.env.JWT_EXPIRES_IN = "1 hour";

    assert.throws(
      () => getAccessTokenLifetimeMs(),
      /JWT_EXPIRES_IN must use seconds, minutes, hours, or days/,
    );
  });
});

test("rejects a zero JWT lifetime", () => {
  withTestJwtConfig(() => {
    process.env.JWT_EXPIRES_IN = "0s";

    assert.throws(
      () => getAccessTokenLifetimeMs(),
      /JWT_EXPIRES_IN must specify a valid positive duration/,
    );
  });
});

test("rejects a JWT lifetime that exceeds safe numeric limits", () => {
  withTestJwtConfig(() => {
    process.env.JWT_EXPIRES_IN = "999999999999999999999d";

    assert.throws(
      () => getAccessTokenLifetimeMs(),
      /JWT_EXPIRES_IN must specify a valid positive duration/,
    );
  });
});

const TEST_SECRET = "a".repeat(128);

const testUser = {
  _id: {
    toString: () => "507f1f77bcf86cd799439011",
  },
};

const validCsrfToken = "b".repeat(64);

function withTestJwtConfig(callback) {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpiry = process.env.JWT_EXPIRES_IN;

  process.env.JWT_SECRET = TEST_SECRET;
  process.env.JWT_EXPIRES_IN = "1h";

  try {
    return callback();
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }

    if (originalExpiry === undefined) {
      delete process.env.JWT_EXPIRES_IN;
    } else {
      process.env.JWT_EXPIRES_IN = originalExpiry;
    }
  }
}

test("generates and verifies a valid JWT", () => {
  withTestJwtConfig(() => {
    const token = generateAccessToken(testUser, validCsrfToken);
    const payload = verifyAccessToken(token);

    assert.equal(typeof token, "string");
    assert.equal(payload.sub, testUser._id.toString());
    assert.equal(payload.csrf, validCsrfToken);
    assert.equal(payload.exp > payload.iat, true);
  });
});

test("rejects a tampered JWT", () => {
  withTestJwtConfig(() => {
    const token = generateAccessToken(testUser, validCsrfToken);

    const tamperedToken = `${token.slice(0, -1)}${
      token.endsWith("A") ? "B" : "A"
    }`;

    assert.throws(() => {
      verifyAccessToken(tamperedToken);
    });
  });
});

test("rejects an expired JWT", () => {
  withTestJwtConfig(() => {
    const expiredToken = jwt.sign({ csrf: validCsrfToken }, TEST_SECRET, {
      subject: testUser._id.toString(),
      algorithm: "HS256",
      expiresIn: -1,
    });

    assert.throws(() => verifyAccessToken(expiredToken), {
      name: "TokenExpiredError",
    });
  });
});

test("rejects a missing JWT secret", () => {
  withTestJwtConfig(() => {
    delete process.env.JWT_SECRET;

    assert.throws(
      () => generateAccessToken(testUser, validCsrfToken),
      /JWT_SECRET must be configured/,
    );
  });
});

test("rejects a JWT secret shorter than 64 characters", () => {
  withTestJwtConfig(() => {
    process.env.JWT_SECRET = "short-secret";

    assert.throws(
      () => generateAccessToken(testUser, validCsrfToken),
      /JWT_SECRET must be configured/,
    );
  });
});

test("rejects an invalid CSRF token", () => {
  withTestJwtConfig(() => {
    assert.throws(
      () => generateAccessToken(testUser, "invalid"),
      /A valid CSRF token is required/,
    );
  });
});
