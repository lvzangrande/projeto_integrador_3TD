import express from 'express';
<<<<<<< HEAD
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarMedidoresRoutes({medidorController}){
    const router = express.Router();
    router.use(autenticar, exigirAdmin);

    router.get('/',medidorController.listar);
    router.get('/:id',medidorController.buscar);
    router.post('/', exigirAdmin, medidorController.criar);
    return router
}
=======

export function criarMedidoresRoutes({medidorController}){
    const router = express.Router();

    router.get('/',medidorController.listar);
    router.get('/:id',medidorController.buscar);
    router.post('/', medidorController.criar);
    return router
}
>>>>>>> main
