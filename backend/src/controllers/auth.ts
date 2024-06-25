import { StatusCodes } from "http-status-codes";
import * as authService from "../services/authService";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";
import { ValidationBody } from "../interfaces";
import { sendResponse } from "../util/helpers";
import { Request, Response, NextFunction } from "express";

export const postLogin = async (req: any, res: any, next: any) => {
	try {
		const result: ValidationBody = await authService.userLogin(req.body);

		if (!result.isSuccess) {
			throw new InvalidCredentialsError(result.message as string);
		}
        sendResponse(res, StatusCodes.OK, { token: result.token });
	
	} catch (error) {
		next(error);
	}
};


export const signUp = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const successMsg = await authService.userSignUp(req.body);
		sendResponse(res, StatusCodes.CREATED, { message: successMsg });
	} catch (error) {
		next(error);
	}
};