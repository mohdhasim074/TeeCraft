import jwt from "jsonwebtoken";

const DEFAULT_EXPIRATION = "1h";

function getJwtConfig() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 64) {
    throw new Error(
      "JWT_SECRET must be configured with at least 64 characters.",
    );
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRATION,
  };
}
//
export function getAccessTokenLifetimeMs() {
  const { expiresIn } = getJwtConfig();

  // Support explicit durations such as 30s, 15m, 1h, and 2d.
  const match = /^(\d+)(s|m|h|d)$/.exec(expiresIn);

  if (!match) {
    throw new Error(
      "JWT_EXPIRES_IN must use seconds, minutes, hours, or days (for example, 1h).",
    );
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const millisecondsPerUnit = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  const lifetimeMs = amount * millisecondsPerUnit[unit];

  if (!Number.isSafeInteger(lifetimeMs) || lifetimeMs <= 0) {
    throw new Error("JWT_EXPIRES_IN must specify a valid positive duration.");
  }

  return lifetimeMs;
}
//
export function generateAccessToken(user, csrfToken) {
  const { secret, expiresIn } = getJwtConfig();

  if (typeof csrfToken !== "string" || csrfToken.length !== 64) {
    throw new Error("A valid CSRF token is required.");
  }

  return jwt.sign(
    {
      csrf: csrfToken,
      tokenVersion: user.tokenVersion ?? 0,
    },
    secret,
    {
      subject: user._id.toString(),
      expiresIn,
      algorithm: "HS256",
    },
  );
}

export function verifyAccessToken(token) {
  const { secret } = getJwtConfig();

  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });
}
