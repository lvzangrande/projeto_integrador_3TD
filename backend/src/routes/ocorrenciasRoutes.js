import express from 'express';

export function criarOcorrenciasRoutes({ocorrenciasController}){
    const router = express.Router();

    router.get('/',ocorrenciasController.listar);
    router.get('/:id',ocorrenciasController.buscar);
    router.post('/', ocorrenciasController.criar);
    return router
}