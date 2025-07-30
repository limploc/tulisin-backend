import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";
import exampleRoutes from "./routes/exampleRoutes";

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// API documentation
const swaggerDoc = JSON.parse(fs.readFileSync(process.cwd() + "/specs/tulisin-api.json", "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Example routes (demonstrating error handling)
app.use("/api/v1", exampleRoutes);

// TODO: Add your actual API routes here
// app.use('/api/v1', authRoutes);
// app.use('/api/v1', userRoutes);
// app.use('/api/v1', sectionRoutes);
// app.use('/api/v1', noteRoutes);
// app.use('/api/v1', aiRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log("API Documentation: http://localhost:3000/api-docs");
  console.log("Error Demo: http://localhost:3000/api/v1/demo/errors?errorType=validation");
});
