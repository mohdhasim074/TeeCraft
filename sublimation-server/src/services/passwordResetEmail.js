import nodemailer from "nodemailer";

export async function sendPasswordResetEmail({ email, name, token }) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
    PASSWORD_RESET_URL,
    NODE_ENV,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !SMTP_FROM ||
    !PASSWORD_RESET_URL
  ) {
    throw new Error("Password-reset email service is not configured.");
  }

  const resetUrl = new URL(PASSWORD_RESET_URL);

  if (NODE_ENV === "production" && resetUrl.protocol !== "https:") {
    throw new Error("Production password-reset URLs must use HTTPS.");
  }

  resetUrl.searchParams.set("token", token);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "TeeCraft password reset",
    text: [
      `Hello ${name},`,
      "",
      "A password reset was requested for your TeeCraft account.",
      "",
      `Use this link within 15 minutes: ${resetUrl.toString()}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });
}
