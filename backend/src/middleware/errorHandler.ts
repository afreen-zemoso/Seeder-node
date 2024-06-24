import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../util/helpers";

const errorHandler = (
	error: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	sendResponse(res, error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR, {
		message: error.message,
	});

};

export default errorHandler;
