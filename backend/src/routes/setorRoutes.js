import express from 'express';

export function criarSetorRoutes({setorController}){
    const router = express.Router();

    router.get('/',setorController.listar);
    router.get('/:id',setorController.buscar);
    router.post('/', setorController.criar);
    return router
}