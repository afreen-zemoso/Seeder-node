import {  Response, NextFunction } from "express";
import redisClient from "../util/redisClient";
import { AuthenticatedRequest } from "../interfaces";
import { STRINGS } from "../util/constants";

const cacheMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return next();
	}
	let key = req.originalUrl + req.user.id;

	if(!req.query.userId)
		key += STRINGS.CONTRACTS;

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
