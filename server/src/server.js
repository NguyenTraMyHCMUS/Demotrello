import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./routes/index.js";
import { connectToDatabase, disconnectFromDatabase } from "./config/db.js";
import cookieParser from "cookie-parser";


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", routes);

let server;

const startServer = async () => {
  try {
    await connectToDatabase();

    server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", async (error) => {
  console.error("Unhandled Rejection:", error);
  if (server) {
    server.close(async () => {
      await disconnectFromDatabase();
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  console.error("Uncaught Exception:", error);
  await disconnectFromDatabase();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  if (server) {
    server.close(async () => {
      await disconnectFromDatabase();
      process.exit(0);
    });
  }
});
