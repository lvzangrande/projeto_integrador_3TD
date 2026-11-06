import * as authService from '../services/AuthService.js';

function returnError(error, res, next){
	const resAndError = [];
	if (error instanceof TypeError || error.status === 409 || error.status === 401){
		resAndError.push(res, error);
	}
	if (error instanceof TypeError){
		return returnError422(resAndError);
	}
	if (error.status === 409){
		return returnError409(resAndError);
	}
	if (error.status === 401){
		return returnError401(resAndError);
	}
	return next(error)
	
}

function returnError422(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(422).json({ success: false, error: error.message });
}

function returnError409(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(409).json({ success: false, error: error.message });
}

function returnError401(resAndError){
	const res = resAndError[0];
	const error = resAndError[1];
	return res.status(401).json({ success: false, error: error.message });
}

export async function register(req, res, next){
	try{
		const reqAndRes = [];
		reqAndRes.push(req, res);
		attemptToRegisterUser(reqAndRes);
	}
	catch(error){
		returnError(error, res, next);
	}
}

async function attemptToRegisterUser(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const user = await authService.registrar(req.body);
	return res.status(201).json({ success: true, data: user });
}

export async function login(req, res, next){
	try{
		const reqAndRes = [];
		reqAndRes.push(req, res);
		attemptToLogUserIn(reqAndRes);
	}
	catch{
		returnError(error, res, next);
	}
}

async function attemptToLogUserIn(reqAndRes){
	const req = reqAndRes[0];
	const res = reqAndRes[1];
	const session await authService.login(req.body);
	return res.status(200).json{ success: true, data: session });
}


