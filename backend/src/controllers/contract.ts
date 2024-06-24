import { Request, Response, NextFunction } from "express";
import * as contractService from "../services/contractService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { CONTRACT_MESSAGES, STRINGS } from "../util/constants";
import { AuthenticatedRequest, Contract } from "../interfaces";
import { sendResponse } from "../util/helpers";

export const getContractsOfUser = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		let contracts: Contract[] = req.cachedData;

		if(!contracts)
		{
			let key = req.originalUrl;
			const userId = req.query.userId;
			contracts = userId
				? await contractService.getContractsOfUser(userId)
				: await contractService.getAllContracts();

			if(req.user)
			{
				key += req.user.id;
				key += userId ? '' : STRINGS.CONTRACTS;
				redisClient.setEx(key, 3600, JSON.stringify(contracts));
			}
		}
		sendResponse(res, StatusCodes.OK, {
			message: CONTRACT_MESSAGES.SUCCESS_FETCH,
			contracts,
		});

	} catch (error) {
		next(error);
	}
};

export const createContract = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const successMsg = await contractService.createContract(req.body);
        sendResponse(res, StatusCodes.CREATED, { message: successMsg });
	} catch (error) {
		next(error);
	}
};
