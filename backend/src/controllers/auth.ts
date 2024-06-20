import { StatusCodes } from "http-status-codes";
import * as authService from "../services/authService";
import redisClient from "../util/redisClient";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import { validationBody } from "../interfaces";

export const postLogin = async(req: any, res: any, next: any) => {
	try {
		const result: validationBody = await authService.userLogin(req.body);

		if (!result.isSuccess) {
			throw new InvalidCredentialsError(result.message as string);
		}

		const key = req.originalUrl;
		redisClient.setEx(key, 3600, JSON.stringify(result.token));

		res.status(StatusCodes.OK).json({ token: result.token });

	} catch (error) {
		next(error);
	}
};

