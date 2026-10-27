import "dotenv/config";

import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { configureDns } from "./config/dns.js";

const port = Number(process.env.PORT);
const clientOrigin = process.env.CLIENT_ORIGIN;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("PORT must be a valid integer between 1 and 65535.");
  process.exit(1);
}

if (!clientOrigin) {
  console.error("CLIENT_ORIGIN is required.");
  process.exit(1);
}

let server;
let shuttingDown = false;

async function startServer() {
  try {
    // Apply the development DNS workaround, if configured.
    configureDns();

    // Do not start the HTTP server until MongoDB connects.
    await connectDatabase();

    server = app.listen(port, () => {
      console.log(`TeeCraft API listening on port ${port}`);
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      void shutdown("HTTP_SERVER_ERROR", 1);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);

    try {
      await disconnectDatabase();
    } catch (cleanupError) {
      console.error("Database cleanup failed:", cleanupError.message);
    }

    process.exitCode = 1;
  }
}

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`${signal} received. Shutting down TeeCraft API...`);

  // Prevent shutdown from waiting indefinitely.
  const forceExitTimer = setTimeout(() => {
    console.error("Shutdown timed out. Forcing process exit.");
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log("HTTP server closed.");
    }

    await disconnectDatabase();

    console.log("TeeCraft API stopped successfully.");
  } catch (error) {
    console.error("Shutdown failed:", error.message);
    exitCode = 1;
  } finally {
    clearTimeout(forceExitTimer);
    process.exitCode = exitCode;
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// Start the application exactly once.
await startServer();
