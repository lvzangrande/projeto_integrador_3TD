import express from "express";

export function criarReunioesRoutes({reunioesController}){
    const router = express.Router();

    router.get('/', reunioesController.listar);
    router.get('/id', reunioesController.buscar);
    router.post('/', reunioesController.criar);
    return router
}
