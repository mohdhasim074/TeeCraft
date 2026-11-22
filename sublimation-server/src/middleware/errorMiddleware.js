export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode <= 599
      ? err.statusCode
      : 500;

  // Log a minimal diagnostic without returning internal details to clients.
  console.error("API error:", {
    statusCode,
    method: req.method,
    path: req.path,
  });

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error."
        : "Request could not be processed.",
  });
}
