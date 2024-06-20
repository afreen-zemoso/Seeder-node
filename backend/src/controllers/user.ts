import e, { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import { StatusCodes } from "http-status-codes";
import redisClient from "../util/redisClient";
import { NotFoundError } from "../errors/NotFoundError";
import { USER_MESSAGES } from "../util/constants";

export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const successMsg = await userService.createUser(req.body);

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(successMsg));
		
		res.status(StatusCodes.CREATED).json({ message: successMsg });
	} catch (error) {
        next(error);
	}
};

export const getUserByEmail = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const emailId = req.query.email;
		if(emailId)
		{
		const user = await userService.getUserByEmail(emailId as string);
		if(!user)
			throw new NotFoundError(USER_MESSAGES.ERROR_FETCH);

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(user));

		res.status(StatusCodes.OK).json(user);
		}
		else {
			throw new Error("Email query parameter is required");
		}
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
		const userId = req.params.id;
		const successMsg = await userService.updateUser(userId, req.body);

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(successMsg));

		res.status(StatusCodes.OK).json(successMsg);
	} catch (error) {
		next(error);
	}
};

export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const users = await userService.getUsers();

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(users));

		res.status(StatusCodes.OK).json({ users });
	} catch (error) {
		next(error);
	}
};