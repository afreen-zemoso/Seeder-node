import { Request, Response, NextFunction } from "express";
import * as contractService from "../services/contractService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { AUTH_MESSAGES, CONTRACT_MESSAGES, STRINGS } from "../util/constants";
import { AuthenticatedRequest, Contract } from "../interfaces";
import { clearCache, getLoggedInUserId, sendResponse } from "../util/helpers";

export const getContractsOfUser = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		let contracts: Contract[] = req.cachedData;

		if(!contracts)
		{
			const userId = getLoggedInUserId(req);

			if (!userId) 
				throw new Error(AUTH_MESSAGES.NOT_AUTHENTICATED);

			contracts = await contractService.getContractsOfUser(userId);

			const key = req.originalUrl + userId;
			redisClient.setEx(key, 3600, JSON.stringify(contracts));
		}
		sendResponse(res, StatusCodes.OK, {
			message: CONTRACT_MESSAGES.SUCCESS_FETCH,
			contracts,
		});

	} catch (error) {
		next(error);
	}
};

export const getAllContracts = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		let contracts: Contract[] = req.cachedData;

		if (!contracts) {
			contracts = await contractService.getAllContracts();

			const userId = getLoggedInUserId(req);
			if (userId) {
				const key = req.originalUrl + userId;
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
		clearCache();
        sendResponse(res, StatusCodes.CREATED, { message: successMsg });
	} catch (error) {
		next(error);
	}
};
