import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { handleValidationErrors } from "../../middleware/validationMiddleware";
import * as expressValidator from "express-validator";

// Mock the validationResult function from express-validator
jest.mock("express-validator");

describe("Validation Middleware", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("Should pass validation and call next if no errors", () => {
        (expressValidator.validationResult as unknown as jest.Mock)
        .mockReturnValue({
			isEmpty: () => true,
			array: () => null,
		});

		handleValidationErrors(req as Request, res as Response, next);

		expect(expressValidator.validationResult).toHaveBeenCalledWith(req);
		expect(next).toHaveBeenCalled();
	});

	test("Should return 400 and error messages if validation errors exist", () => {
		const errorMessage = "Invalid input";
		(expressValidator.validationResult as unknown as jest.Mock)
        .mockReturnValue({
			isEmpty: () => false,
			array: () => [{ msg: errorMessage }],
		});

		handleValidationErrors(req as Request, res as Response, next);

		expect(expressValidator.validationResult).toHaveBeenCalledWith(req);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.json).toHaveBeenCalledWith({ errors: [errorMessage] });
		expect(next).not.toHaveBeenCalled();
	});
});