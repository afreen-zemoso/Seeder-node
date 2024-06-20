import { Request, Response, NextFunction } from "express";
import * as contractService from "../services/contractService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { CONTRACT_MESSAGES } from "../util/constants";

export const getContractsOfUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const contracts = await contractService.getContractsOfUser(
			req.query.userId as string
		);

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(contracts));

		res.status(StatusCodes.OK).json({
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

        const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(successMsg));
        
		res.status(StatusCodes.CREATED).json({ message: successMsg });
	} catch (error) {
		next(error);
	}
};
