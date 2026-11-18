import express from "express";

export function criarHealthRoutes({ healthController }) {
  const router = express.Router();
  router.get("/", healthController.verificar);
  return router;
}
