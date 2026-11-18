import express from "express";
import { autenticar, exigirFiliado } from "../middlewares/auth.js";

export function criarReunioesRoutes({ reunioesController }) {
  const router = express.Router();
  router.use(autenticar, exigirFiliado);
  router.get("/", reunioesController.listar);
  router.get("/:id", reunioesController.buscar);
  router.post("/", reunioesController.criar);
  return router;
}
