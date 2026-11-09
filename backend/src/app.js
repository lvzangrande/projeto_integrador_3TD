import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import { pool } from "./config/database.js";
import { criarUsuarioModel } from "../models/UsuarioModels.js";
import { criarUsuarioService } from "../services/UsuarioService.js";
import { criarUsuarioController } from "./controllers/UsuarioController.js";
import { criarUsuarioRoutes } from "./routes/usuarioRoutes.js";

import { criarSetorModel } from "../models/SetorModels.js";
import { criarSetorService } from "../services/SetorService.js";
import { criarSetorController } from "./controllers/SetorController.js";
import { criarSetorRoutes } from "./routes/setorRoutes.js";

import { criarMedidoresModel } from "../models/MedidoresModel.js";
import { criarMedidoresService } from "../services/MedidoresService.js";
import { criarMedidoresController } from "./controllers/MedidoresController.js";
import { criarMedidoresRoutes } from "./routes/medidoresRoutes.js";

const usuarioModel = criarUsuarioModel({ pool });
const usuarioService = criarUsuarioService({ usuarioModel });
const usuarioController = criarUsuarioController({ usuarioService });

const setorModel = criarSetorModel({ pool });
const setorService = criarSetorService({ setorModel });
const setorController = criarSetorController({ setorService });

const medidorModel = criarMedidoresModel({ pool });
const medidorService = criarMedidoresService({ medidorModel });
const medidorController = criarMedidoresController({ medidorService });

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

app.use("/usuario", criarUsuarioRoutes({ usuarioController }));
app.use("/setor", criarSetorRoutes({ setorController }));
app.use("/medidores", criarMedidoresRoutes({ medidorController }));


app.use((req, res) => {
  res.status(404).json({
    erro: `A rota ${req.method} ${req.originalUrl} não existe.`,
  });
});

app.use(errorHandler);

export default app;
