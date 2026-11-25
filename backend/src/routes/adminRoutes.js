import express from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarAdminRoutes({ adminController }) {
  const router = express.Router();
  router.use(autenticar, exigirAdmin);
  router.get("/dados", adminController.dados);
  router.put("/tarifa", adminController.definirTarifa);
  router.patch("/:recurso/:id/status", adminController.alterarStatus);
  router.post("/:recurso", adminController.criar);
  router.put("/:recurso/:id", adminController.atualizar);
  return router;
}
