import { Request, Response, NextFunction } from "express";
import * as cashkickService from "../services/cashkickService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { AUTH_MESSAGES, CASHKICK_MESSAGES } from "../util/constants";
import { AuthenticatedRequest, UserCashkick } from "../interfaces";
import { clearCache, getLoggedInUserId, sendResponse } from "../util/helpers";

export const getUserCashkicks = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		let cashkicks: UserCashkick[] = req.cachedData;

		if (!cashkicks) {
			const userId = getLoggedInUserId(req);
			
			if (!userId) 
				throw new Error(AUTH_MESSAGES.NOT_AUTHENTICATED);

			cashkicks = await cashkickService.getUserCashkicks(userId);

			const key = req.originalUrl + userId;
			redisClient.setEx(key, 3600, JSON.stringify(cashkicks));
			
		}
        sendResponse(res, StatusCodes.OK, {
			message: CASHKICK_MESSAGES.SUCCESS_FETCH,
			cashkicks,
		});

	} catch (error) {
		next(error);
	}
};

export const createCashkick = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = getLoggedInUserId(req);
			
		if (!userId) 
			throw new Error(AUTH_MESSAGES.NOT_AUTHENTICATED);
		const successMsg = await cashkickService.createCashkick({...req.body, userId: userId});
		clearCache();
		sendResponse(res, StatusCodes.CREATED, { message: successMsg });
	} catch (error) {
		next(error);
	}
};
