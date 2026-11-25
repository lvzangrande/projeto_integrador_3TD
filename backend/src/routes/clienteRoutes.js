import express from "express";
import { autenticar, exigirCliente } from "../middlewares/auth.js";
import { criarClienteController } from "../controllers/ClienteController.js";

export function criarClienteRoutes({ pool, clienteLeiturasService }) {
  const router = express.Router();
  const controller = criarClienteController({ pool, clienteLeiturasService });
  router.use(autenticar, exigirCliente);
  router.get("/resumo", controller.resumo);
  router.get("/estrutura", controller.estrutura);
  router.get("/leituras", controller.leituras);
  router.post("/leituras", controller.registrarLeitura);
  router.get("/ocorrencias", controller.ocorrencias);
  return router;
}
