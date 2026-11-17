import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import { pool } from "./config/database.js";
import { criarHealthModel } from "../models/HealthModels.js";
import { criarHealthService } from "../services/HealthService.js";
import { criarHealthController } from "./controllers/HealthController.js";
import { criarHealthRoutes } from "./routes/healthRoutes.js";

const healthModel = criarHealthModel({ pool });
const healthService = criarHealthService({ healthModel });
const healthController = criarHealthController({ healthService });

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({ message: "API do projeto base" });
});

app.use("/health", criarHealthRoutes({ healthController }));

app.use((req, res) => {
  res.status(404).json({
    erro: `A rota ${req.method} ${req.originalUrl} não existe.`,
  });
});

app.use(errorHandler);

export default app;
