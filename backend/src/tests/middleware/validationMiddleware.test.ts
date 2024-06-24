import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { handleValidationErrors } from "../../middleware/validationMiddleware";
import * as expressValidator from "express-validator";
import * as helpers from "../../util/helpers"; 

jest.mock("express-validator");
jest.mock("../../util/helpers");

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
		(
			expressValidator.validationResult as unknown as jest.Mock
		).mockReturnValue({
			isEmpty: () => true,
			array: () => null,
		});

		handleValidationErrors(req as Request, res as Response, next);

		expect(expressValidator.validationResult).toHaveBeenCalledWith(req);
		expect(next).toHaveBeenCalled();
	});

	test("Should return 400 and error messages if validation errors exist", () => {
		const errorMessage = "Invalid input";
		(
			expressValidator.validationResult as unknown as jest.Mock
		).mockReturnValue({
			isEmpty: () => false,
			array: () => [{ msg: errorMessage }],
		});

		handleValidationErrors(req as Request, res as Response, next);

		expect(expressValidator.validationResult).toHaveBeenCalledWith(req);
		expect(helpers.sendResponse).toHaveBeenCalledWith(
			res,
			StatusCodes.BAD_REQUEST,
			{ errors: [errorMessage] }
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should call next with an error if an exception occurs", () => {
		const error = new Error("Test error");
		(expressValidator.validationResult as unknown as jest.Mock).mockImplementation(
			() => {
				throw error;
			}
		);

		handleValidationErrors(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
		expect(helpers.sendResponse).not.toHaveBeenCalled();
	});
});
