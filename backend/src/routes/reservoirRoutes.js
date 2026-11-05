import express from 'express';
import * as reservoirController from '../controllers/reservoirController.js';
import { imageUpload } from '../middlewares/uploadMiddleware.js'

let authenticate = (_req, _res, next) => next();
let authorizeAdmin = (_req, _res, next) => next();

export const reservoirRouter = express.router();

function authenticateReqResNext(isAdmin){
	if (isAdmin){
		authenticateReqResNextForAdmin();
		return;
	}
	else{
		authenticate(req, res, next);
	}
}

function authenticateReqResNextForAdmin(){
	authorizeAdmin(req, rest, next);
}

reservoirRouter.get('/', reservoirController.list);
reservoirRouter.get('/:id', reservoirController.searchById);
reservoirRouter.post('/', (req, res, next) => authenticateReqResNext(), reservoirController.create)
reservoirRouter.put(':/id', (req, res, next) => authenticateReqResNext(), reservoirController.update)
reservoirRouter.delete('/:id', (req, res, next) => authenticateReqResNext(), (req, res, next) => authenticateReqResNext(true), reservoirController.delete)

export function configReservoirSecurity(middlewareAuth, middlewareAdmin){
	if (middlewareAuth) authenticate = middlewareAuth;
	if (middlewareAdmin) authorizeAdmin = middlewareAdmin;
}



