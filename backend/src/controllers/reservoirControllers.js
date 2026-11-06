import * as reservoirService from '../services/reservoirService.js';

function returnError(error, res, next){
	const resAndError = [];
	if (error instanceof TypeError || error.message.includes('not found'){
		resAndError.push(error,res);
	}
	if (error instanceof TypeError){
		return returnError404(resAndError);
	}
	if (error.message.includes('not found')){
		return returnError400(resAndError);
	}
	return next(error);
}

function returnError404(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(400).json({ success: false, error: error.message });
}

function returnError400(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(400).json({ success: false, error: error.message });
}

export async function list(req, res, next){
	try{
		return attemptToReturnDataAndPaginationAndSuccess(req);
	}
	catch(error){
		return returnError(error, res, next)
	}
}

function attemptToReturnDataAndPaginationAndSuccess(req){
	const result = await reservoirService.list(req.query);
	return res.status(200).json({
		sucess: true,
		data: result.reservoirs,
		pagination: result.pagination
	)}
}

export async function searchById(req, res, next){
	try{
		const reqAndRes = [];
		reqAndRes.push(req, res);
		attemptToSearchById(reqAndRes);
	}
	catch (error) {
		return returnError(error, res, next);
	}
}

async function attemptToSearchById(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const reservoir = await reservoirService.searchById(req.params.id);
	return res.status(200).json({ success: true, data: reservoir });
}

export async function create(req, res, next){
	try{
		const reqAndRes = [];
		reqAndRes.push(req, res);
		attemptToCreateNewReservoir(reqAndRes);
	}
	catch (error) {
		returnError(error, res, next);
	}

}

async function attemptToCreateNewReservoir(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const reservoir = await reservoirService.update(req.params.id, req.body);
	return res.status(201).json({ success: true, data: reservoir })
}

export async function update(req, res, next){
	try{
		const reqAndRes = [];
		reqAndRes.push(req, res);
		attemptToUpdateReservoir(reqAndRes);
	}
	catch (error) {
		returnError(error)
	}
}

async function attempt attemptToUpdateReservoir(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const reservoir = await.reservoirService.update(req.params.id, req.body);
	return res.status(200).json({ success: true, data: reservoir });
}

export async function delete(req, res, next){
	try{
		reqAndRes = [];
		reqAndRes.push(req, res);
		attemptToDeleteReservoir(reqAndRes);
	}
	catch (error) {
		returnError(error, res, next);
	}
}

async function attemptToDeleteReservoir(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	await reservoirService.delete(req.params.id);
	return res.status(204).send();
}

