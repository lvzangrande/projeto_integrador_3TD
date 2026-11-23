import express from 'express';
<<<<<<< HEAD
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarLeiturasRoutes({leituraController}){
    const router = express.Router();
    router.use(autenticar, exigirAdmin);

    router.get('/',leituraController.listar);
    router.get('/:id',leituraController.buscar);
    router.post('/', exigirAdmin, leituraController.criar);
    return router
}
=======

export function criarLeiturasRoutes({leituraController}){
    const router = express.Router();

    router.get('/',leituraController.listar);
    router.get('/:id',leituraController.buscar);
    router.post('/', leituraController.criar);
    return router
}
>>>>>>> main
