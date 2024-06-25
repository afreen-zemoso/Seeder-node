import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { AUTH_MESSAGES, USER_MESSAGES } from "../util/constants";
import { AuthenticatedRequest } from "../interfaces";
import { clearCache, getLoggedInUserId, sendResponse } from "../util/helpers";

export const getUserByEmail = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const emailId = req.query.email;
		if(!emailId)
			throw new Error(USER_MESSAGES.REQUIRED_EMAIL);

		let user = req.cachedData;
		if(!user)
		{
			const userId = getLoggedInUserId(req);
			user = await userService.getUserByEmail(emailId);

			if (!userId) throw new Error(AUTH_MESSAGES.NOT_AUTHENTICATED);
			
			const key = req.originalUrl + userId;
			redisClient.setEx(key, 3600, JSON.stringify(user));
		}
        sendResponse(res, StatusCodes.OK, user);
		
	} catch (error) {
		next(error);
	}
};

export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const userId = getLoggedInUserId(req);

		if (!userId) throw new Error(AUTH_MESSAGES.NOT_AUTHENTICATED);

		const successMsg = await userService.updateUser(userId, req.body);
		clearCache();
        sendResponse(res, StatusCodes.OK, successMsg);

	} catch (error) {
		next(error);
	}
};
