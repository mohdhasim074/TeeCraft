import mongoose from "mongoose";

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured.");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    // Log the cause locally, without exposing the connection URI.
    console.error("MongoDB connection failed:", error.message);

    throw new Error("Unable to establish database connection.");
  }
}

export async function disconnectDatabase() {
  const connectionState = mongoose.connection.readyState;

  console.log("MongoDB state before shutdown:", connectionState);

  // Mongoose readyState:
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting

  if (connectionState === 0) {
    console.log("MongoDB was already disconnected.");
    return;
  }

  console.log("Closing MongoDB connection...");

  await mongoose.disconnect();

  console.log("MongoDB connection closed.");
}
