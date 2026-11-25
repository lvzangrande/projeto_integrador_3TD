import express from 'express';
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarLeiturasRoutes({leituraController}){
    const router = express.Router();

    router.use(autenticar, exigirAdmin);
    router.get('/',leituraController.listar);
    router.get('/:id',leituraController.buscar);
    return router
}
