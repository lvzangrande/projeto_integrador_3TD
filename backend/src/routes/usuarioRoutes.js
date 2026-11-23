import express from "express";
import { autenticar, exigirFiliado } from "../middlewares/auth.js";

export function criarUsuarioRoutes({ usuarioController }) {
  const router = express.Router();
  router.use(autenticar, exigirFiliado);
  router.get("/", usuarioController.listar);
  router.get("/:id", usuarioController.buscar);
  router.post("/", usuarioController.criar);
  return router;
}
