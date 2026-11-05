import * as reservoirService from '../service/reservoirService.js';

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

function returnError(error, res, next){
	resAndError = []
	if (error instanceof TypeError || error.message.includes('not found'){
		const resAndError = [];
		resAndError.push(error,res);
	}
	if (error instanceof TypeError){
		return returnResStatus404(resAndError);
	}
	else if (error.message.includes('not found')){
		return returnResStatus400(resAndError);
	}
	else{
		return next(error);
	}
}

function returnResStatus404(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(400).json({ success: false, error: error.message });
}

function returnResStatus400(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(400).json({ success: false, error: error.message });
}

export async function searchById(req, res, next){
	try{
		reqAndRes = [];
		reqAndRes.push(req, res);
		searchByIdQueryRequestAttempt(reqAndRes);
	}
	catch{
		return returnError(error, res, next);
	}
}

async function searchByIdQueryRequestAttempt(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const reservoir = await reservoirService.searchById(req.params.id);
	return res.status(200).json({ success: true, data: reservoir });
}

export async function create(req, res, next){
	try{
		reqAndRes = [];
		reqAndRes.push(req, res);
		createNewReservoirAttempt(reqAndRes);
	}
	catch{
		returnError(error, res, next);
	}

}

async function createNewReservoirAttempt(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const reservoir = await reservoirService.update(req.params.id, req.body);
	return res.status(201).json({ success: true, data: reservoir })
}

export async function update(req, res, next){
	try{
		
	}
	catch{

	}
}

async function attemptToDeleteReservoir(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	await reservoirService.delete(req.params.id);
	return res.status(204).send();
}
