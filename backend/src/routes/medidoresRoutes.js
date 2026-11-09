import express from 'express';

export function criarMedidoresRoutes({medidorController}){
    const router = express.Router();

    router.get('/',medidorController.listar);
    router.get('/:id',medidorController.buscar);
    router.post('/', medidorController.criar);
    return router
}