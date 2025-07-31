import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { globalErrorHandler } from "./middleware/errorHandler";
import { initializeDatabase } from "./database/database";
import { getDatabaseConfig } from "./config/config";

const app = express();

app.use(express.json());
app.use(cors());

const swaggerDoc = JSON.parse(fs.readFileSync(process.cwd() + "/specs/tulisin-api.json", "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

const initializeApp = async () => {
  try {
    const db = initializeDatabase(getDatabaseConfig());
    await db.testConnection();

    app.use(globalErrorHandler);

    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
      console.log("API Documentation: http://localhost:3000/api-docs");
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log("Received shutdown signal. Closing database connections...");
  const { closeDatabase } = await import("./database/database");
  await closeDatabase();
  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

initializeApp();
