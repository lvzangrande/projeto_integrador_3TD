import express from "express";
import { autenticar } from "../middlewares/auth.js";

export function criarAutenticacaoRoutes({ autenticacaoController }) {
  const router = express.Router();
  router.post("/login", autenticacaoController.entrar);
  router.post("/logout", autenticacaoController.sair);
  router.get("/me", autenticar, autenticacaoController.atual);
  return router;
}
