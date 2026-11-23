import express from 'express';
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarOcorrenciasRoutes({ocorrenciasController}){
    const router = express.Router();
    router.use(autenticar, exigirAdmin);

    router.get('/',ocorrenciasController.listar);
    router.get('/:id',ocorrenciasController.buscar);
    router.post('/', exigirAdmin, ocorrenciasController.criar);
    return router
}
