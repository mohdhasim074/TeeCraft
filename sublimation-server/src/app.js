import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import { allowedOrigins } from "./middleware/csrfMiddleware.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header are handled by the API's
      // own authentication and trusted-origin rules.
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Application routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TeeCraft API is running",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
