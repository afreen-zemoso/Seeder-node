import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../util/helpers";

const handleValidationErrors = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			let errorMessages: string[] = [];
			errors.array().map((error: any) => errorMessages.push(error.msg));
			sendResponse(res, StatusCodes.BAD_REQUEST, {
				errors: errorMessages,
			});
		} else {
			next();
		}
	} catch (error) {
		console.error("Error in handleValidationErrors:", error);
		next(error);
	}
};

export { handleValidationErrors };
