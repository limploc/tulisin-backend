import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { globalErrorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());

const swaggerDoc = JSON.parse(fs.readFileSync(process.cwd() + "/specs/tulisin-api.json", "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(globalErrorHandler);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log("API Documentation: http://localhost:3000/api-docs");
  console.log("Error Demo: http://localhost:3000/api/v1/demo/errors?errorType=validation");
});
