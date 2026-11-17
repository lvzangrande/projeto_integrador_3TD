import express from 'express';

export function criarHealthRoutes({healthController}){
    const router = express.Router();

    router.get('/',healthController.listar);
    router.get('/:id',healthController.buscar);
    router.post('/', healthController.criar);
    return router
}