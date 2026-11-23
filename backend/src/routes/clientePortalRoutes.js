import express from "express";
import { autenticar, exigirClienteOuAdmin } from "../middlewares/auth.js";

export function criarClientePortalRoutes({ clientePortalController }) {
  const router = express.Router();
  router.use(autenticar, exigirClienteOuAdmin);
  router.get("/operacao", clientePortalController.buscarOperacao);
  return router;
}
