import express from 'express';

export function criarUsuarioRoutes({usuarioController}){
    const router = express.Router();

    router.get('/',usuarioController.listar);
    router.get('/:id',usuarioController.buscar);
    router.post('/', usuarioController.criar);
    return router
}