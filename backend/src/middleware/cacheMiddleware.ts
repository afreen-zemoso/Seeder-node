import {  Response, NextFunction } from "express";
import redisClient from "../util/redisClient";
import { AuthenticatedRequest } from "../interfaces";
import { AUTH_MESSAGES, STRINGS } from "../util/constants";
import { getLoggedInUserId } from "../util/helpers";

const cacheMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	const userId = getLoggedInUserId(req);
	if (!userId) {
		throw new Error(AUTH_MESSAGES.NOT_AUTHENTICATED);
	}
	let key = req.originalUrl + userId;

	try {
		const data = await redisClient.get(key);
		if (data) {
			req.cachedData = JSON.parse(data);
		}
	} catch (err) {
		console.error("Error retrieving data from cache:", err);	}

	next();
};

export default cacheMiddleware;
