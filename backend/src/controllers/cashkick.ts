import { Request, Response, NextFunction } from "express";
import * as cashkickService from "../services/cashkickService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { CASHKICK_MESSAGES } from "../util/constants";
import { AuthenticatedRequest, UserCashkick } from "../interfaces";
import { sendResponse } from "../util/helpers";

export const getUserCashkicks = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		let cashkicks: UserCashkick[] = req.cachedData;

		if (!cashkicks) {
			cashkicks = await cashkickService.getUserCashkicks(
				req.params.userId
			);

			if (req.user) {
				const key = req.originalUrl + req.user.id;
				redisClient.setEx(key, 3600, JSON.stringify(cashkicks));
			}
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
		const successMsg = await cashkickService.createCashkick(req.body);
		sendResponse(res, StatusCodes.CREATED, { message: successMsg });
	} catch (error) {
		next(error);
	}
};
