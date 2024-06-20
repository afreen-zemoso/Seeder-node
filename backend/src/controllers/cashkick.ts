import { Request, Response, NextFunction } from "express";
import * as cashkickService from "../services/cashkickService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { CASHKICK_MESSAGES } from "../util/constants";

export const getUserCashkicks = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const cashkicks = await cashkickService.getUserCashkicks(
			req.params.userId
		);

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(cashkicks));

		res.status(StatusCodes.OK).json({ message: CASHKICK_MESSAGES.SUCCESS_FETCH, cashkicks });
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
		
		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(successMsg));

		res.status(StatusCodes.CREATED).json({ message: successMsg });
	} catch (error) {
		next(error);
	}
};
