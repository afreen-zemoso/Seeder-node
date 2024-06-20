import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandler = (
	error: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).json({
		message: error.message,
	});
};

export default errorHandler;
