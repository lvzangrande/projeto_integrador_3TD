import express from "express";
import { autenticar } from "../middlewares/auth.js";
import { criarRateLimit } from "../middlewares/rateLimit.js";

export function criarAutenticacaoRoutes({ autenticacaoController }) {
  const router = express.Router();
  router.post("/login", autenticacaoController.entrar);
  const limitarRecuperacao = criarRateLimit({ maximo: 5 });
  const limitarRedefinicao = criarRateLimit({ maximo: 10 });
  router.post("/forgot-password", limitarRecuperacao, autenticacaoController.solicitarRedefinicao);
  router.post("/reset-password", limitarRedefinicao, autenticacaoController.redefinirSenha);
  router.post("/esqueci-senha", limitarRecuperacao, autenticacaoController.solicitarRedefinicaoPorCpf);
  router.post("/redefinir-senha", limitarRedefinicao, autenticacaoController.redefinirSenhaPorCpf);
  router.post("/logout", autenticar, autenticacaoController.sair);
  router.get("/me", autenticar, autenticacaoController.atual);
  return router;
}
