import reservoir from '../models/reservoir.js';

import * as reservoirModel from '../models/reservoirModel.js';

function validateId(receivedId){
	const id = Number(receivedId);
	return returnIdIfIdIsValid(id);
}

function returnIdIfIdIsValid(passedId){
	if (!Number.isInteger(passedId) || id <= 0){
		return returnIdTypeError();
	}
	return id;
}

function returnIdTypeError(){
	throw new TypeError('ID deve ser um número inteiro positivo.');
}

export async function list(pageAndLimit){
	verifyIfQueryIsTooBig(pageAndLimit);
}

function verifyIfQueryIsTooBig(pageAndLimit){
	const pageNum = Number(pageAndLimit[0]);
	const limitNum = Number(pageAndLimit[1]);

	if (!Number.isInteger(pageNum) || pageNum <= 0){
		
	}
}
