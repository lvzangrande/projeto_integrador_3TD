import cors from "cors";
import express from "express";
import helmet from "helmet";

import { pool } from "./config/database.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { criarAutenticacaoController } from "./controllers/AutenticacaoController.js";
import { criarUsuarioController } from "./controllers/UsuarioController.js";
import { criarSetorController } from "./controllers/SetorController.js";
import { criarMedidoresController } from "./controllers/MedidoresController.js";
import { criarOcorrenciasController } from "./controllers/OcorrenciasController.js";
import { criarLeiturasController } from "./controllers/LeiturasController.js";
import { criarReunioesController } from "./controllers/ReunioesController.js";
import { criarReservatoriosController } from "./controllers/ReservatoriosController.js";
import { criarAdminController } from "./controllers/AdminController.js";
import { criarAutenticacaoRoutes } from "./routes/autenticacaoRoutes.js";
import { criarUsuarioRoutes } from "./routes/usuarioRoutes.js";
import { criarSetorRoutes } from "./routes/setorRoutes.js";
import { criarMedidoresRoutes } from "./routes/medidoresRoutes.js";
import { criarOcorrenciasRoutes } from "./routes/ocorrenciasRoutes.js";
import { criarLeiturasRoutes } from "./routes/leiturasRoutes.js";
import { criarReunioesRoutes } from "./routes/reunioesRoutes.js";
import { criarReservatoriosRoutes } from "./routes/reservatoriosRoutes.js";
import { criarAdminRoutes } from "./routes/adminRoutes.js";

import { criarAutenticacaoService } from "../services/AutenticacaoService.js";
import { criarUsuarioService } from "../services/UsuarioService.js";
import { criarSetorService } from "../services/SetorService.js";
import { criarMedidoresService } from "../services/MedidoresService.js";
import { criarOcorrenciasService } from "../services/OcorrenciasService.js";
import { criarLeiturasService } from "../services/LeiturasService.js";
import { criarReunioesService } from "../services/ReunioesService.js";
import { criarReservatoriosService } from "../services/ReservatoriosService.js";
import { criarAdminService } from "../services/AdminService.js";

import { criarUsuarioModel } from "../models/UsuarioModels.js";
import { criarSetorModel } from "../models/SetorModels.js";
import { criarMedidoresModel } from "../models/MedidoresModel.js";
import { criarOcorrenciasModel } from "../models/OcorrenciasModel.js";
import { criarLeiturasModel } from "../models/LeiturasModel.js";
import { criarReunioesModel } from "../models/ReunioesModel.js";
import { criarReservatoriosModel } from "../models/ReservatoriosModels.js";
import { criarAdminModel } from "../models/AdminModel.js";
import { criarAcessoModel } from "../models/AcessoModel.js";
import { criarRecuperacaoSenhaModel } from "../models/RecuperacaoSenhaModel.js";
import { criarRecuperacaoSenhaService } from "../services/RecuperacaoSenhaService.js";
import { criarGmailEmailService } from "../services/GmailEmailService.js";

const usuarioModel = criarUsuarioModel({ pool });
const usuarioService = criarUsuarioService({ usuarioModel });
const acessoModel = criarAcessoModel({ pool });
const autenticacaoService = criarAutenticacaoService({ usuarioModel, acessoModel });
const recuperacaoSenhaModel = criarRecuperacaoSenhaModel({ pool });
const recuperacaoSenhaService = criarRecuperacaoSenhaService({
  usuarioModel,
  recuperacaoSenhaModel,
  gmailEmailService: criarGmailEmailService(),
});
const adminModel = criarAdminModel({ pool });
const reunioesModel = criarReunioesModel({ pool });

const api = express.Router();
api.get("/", (_request, response) => response.json({ message: "API WaterControl" }));
api.use("/auth", criarAutenticacaoRoutes({ autenticacaoController: criarAutenticacaoController({ autenticacaoService, recuperacaoSenhaService }) }));
api.use("/admin", criarAdminRoutes({ adminController: criarAdminController({ adminService: criarAdminService({ adminModel }) }) }));
const usuarioRoutes = criarUsuarioRoutes({ usuarioController: criarUsuarioController({ usuarioService }) });
api.use("/usuario", usuarioRoutes);
api.use("/usuarios", usuarioRoutes);
api.use("/reunioes", criarReunioesRoutes({ reunioesController: criarReunioesController({
  reunioesService: criarReunioesService({ reunioesModel, usuarioModel }),
}) }));
api.use("/setor", criarSetorRoutes({ setorController: criarSetorController({ setorService: criarSetorService({ setorModel: criarSetorModel({ pool }) }) }) }));
api.use("/medidores", criarMedidoresRoutes({ medidorController: criarMedidoresController({ medidorService: criarMedidoresService({ medidorModel: criarMedidoresModel({ pool }) }) }) }));
api.use("/ocorrencias", criarOcorrenciasRoutes({ ocorrenciasController: criarOcorrenciasController({ ocorrenciasService: criarOcorrenciasService({ ocorrenciasModel: criarOcorrenciasModel({ pool }) }) }) }));
api.use("/leituras", criarLeiturasRoutes({ leituraController: criarLeiturasController({ leituraService: criarLeiturasService({ leituraModel: criarLeiturasModel({ pool }) }) }) }));
api.use("/reservatorios", criarReservatoriosRoutes({ reservatoriosController: criarReservatoriosController({ reservatoriosService: criarReservatoriosService({ reservatoriosModel: criarReservatoriosModel({ pool }) }) }) }));

const app = express();
app.use(helmet());
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = new Set([frontendOrigin]);
if (process.env.NODE_ENV !== "production") {
  try {
    const localOrigin = new URL(frontendOrigin);
    if (["localhost", "127.0.0.1"].includes(localOrigin.hostname)) {
      for (const hostname of ["localhost", "127.0.0.1"]) {
        localOrigin.hostname = hostname;
        allowedOrigins.add(localOrigin.origin);
      }
    }
  } catch {
    // Invalid FRONTEND_URL will simply not authorize browser origins.
  }
}
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, allowedOrigins.has(origin));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", api);
app.use("/", api);
app.use((request, response) => {
  response.status(404).json({ erro: `A rota ${request.method} ${request.originalUrl} não existe.` });
});
app.use(errorHandler);

export default app;
