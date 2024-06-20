import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

const handleValidationErrors = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		let errorMessages: string[] = [];
		errors.array().map((error: any) => errorMessages.push(error.msg));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ errors: errorMessages });
	} else {
		next();
	}
};

export { handleValidationErrors };
