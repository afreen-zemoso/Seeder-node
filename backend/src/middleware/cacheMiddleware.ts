import { Request, Response, NextFunction } from "express";
import redisClient from "../util/redisClient";

const cacheMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const key = req.originalUrl;

	try {
		const data = await redisClient.get(key);
		if (data) {
			res.status(200).json(JSON.parse(data));
		} else {
			next();
		}
	} catch (err) {
		next(err); 
	}
};

export default cacheMiddleware;
