import express from 'express';

export function criarLeiturasRoutes({leituraController}){
    const router = express.Router();

    router.get('/',leituraController.listar);
    router.get('/:id',leituraController.buscar);
    router.post('/', leituraController.criar);
    return router
}