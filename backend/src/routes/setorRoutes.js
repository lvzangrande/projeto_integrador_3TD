import express from 'express';
<<<<<<< HEAD
import { autenticar, exigirAdmin } from "../middlewares/auth.js";

export function criarSetorRoutes({setorController}){
    const router = express.Router();
    router.use(autenticar, exigirAdmin);

    router.get('/',setorController.listar);
    router.get('/:id',setorController.buscar);
    router.post('/', exigirAdmin, setorController.criar);
    return router
}
=======

export function criarSetorRoutes({setorController}){
    const router = express.Router();

    router.get('/',setorController.listar);
    router.get('/:id',setorController.buscar);
    router.post('/', setorController.criar);
    return router
}
>>>>>>> main
