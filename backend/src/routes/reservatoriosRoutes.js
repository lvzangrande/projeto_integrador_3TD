import express from "express";
<<<<<<< HEAD
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarReservatoriosRoutes({reservatoriosController}){
    const router = express.Router();
    router.use(autenticar, exigirAdmin);

    router.get('/', reservatoriosController.listar);
    router.get('/:id', reservatoriosController.buscar);
    router.post('/', exigirAdmin, reservatoriosController.criar);
=======

export function criarReservatoriosRoutes({reservatoriosController}){
    const router = express.Router();

    router.get('/', reservatoriosController.listar);
    router.get('/:id', reservatoriosController.buscar);
    router.post('/', reservatoriosController.criar);
>>>>>>> main
    return router
}
