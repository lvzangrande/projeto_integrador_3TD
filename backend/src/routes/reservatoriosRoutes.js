import express from "express";
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarReservatoriosRoutes({reservatoriosController}){
    const router = express.Router();
    router.use(autenticar, exigirAdmin);

    router.get('/', reservatoriosController.listar);
    router.get('/:id', reservatoriosController.buscar);
    router.post('/', exigirAdmin, reservatoriosController.criar);
    return router
}
