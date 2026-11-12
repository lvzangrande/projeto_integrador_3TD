import express from "express";

export function criarReservatoriosRoutes({reservatoriosController}){
    const router = express.Router();

    router.get('/', reservatoriosController.listar);
    router.get('/id', reservatoriosController.buscar);
    router.post('/', reservatoriosController.criar);
    return router
}
