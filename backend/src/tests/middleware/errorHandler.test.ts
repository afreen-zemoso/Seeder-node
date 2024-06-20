import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import errorHandler from "../../middleware/errorHandler";

describe("Error Handler Middleware", () => {
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

	test("Should return the provided status code and message from the error", () => {
		const error = {
			statusCode: StatusCodes.BAD_REQUEST,
			message: "Bad Request Error",
		};

		errorHandler(error, req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
		expect(res.json).toHaveBeenCalledWith({ message: error.message });
	});

	test("Should return 500 status code if error status code is not provided", () => {
		const error = {
			message: "Internal Server Error",
		};

		errorHandler(error, req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR
		);
		expect(res.json).toHaveBeenCalledWith({ message: error.message });
	});

	test("Should handle errors without a message", () => {
		const error = {};

		errorHandler(error, req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(
			StatusCodes.INTERNAL_SERVER_ERROR
		);
		expect(res.json).toHaveBeenCalledWith({ message: undefined });
	});
});
