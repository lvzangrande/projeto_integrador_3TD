import express from "express";

export function criarIndicadoresRoutes({ indicadoresController }) {
  const router = express.Router();
  router.get("/agua-poupada", indicadoresController.aguaPoupada);
  return router;
}
