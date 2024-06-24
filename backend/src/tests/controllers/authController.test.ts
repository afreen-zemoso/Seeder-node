import { StatusCodes } from "http-status-codes";
import * as authService from "../../services/authService";
import redisClient from "../../util/redisClient";
import { InvalidCredentialsError } from "../../errors/InvalidCredentialsError";
import { postLogin, signUp } from "../../controllers/auth";
import { STRINGS } from "../../util/constants";
import * as helpers from "../../util/helpers";
import { AuthenticatedRequest } from "../../interfaces";
import { Request, Response, NextFunction } from "express";

jest.mock("../../util/helpers");
jest.mock("../../services/authService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("postLogin", () => {
	let req: any, res: any, next: any;

	beforeEach(() => {
		req = {
			body: { email: "test@example.com", password: STRINGS.PASSWORD },
			originalUrl: "/login",
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		next = jest.fn();
	});

	afterEach(async () => {
		jest.clearAllMocks();
	});

	it("should return 200 and token on successful login", async () => {
		const token = "fake-jwt-token";
		const result = { isSuccess: true, token };
		(authService.userLogin as jest.Mock).mockResolvedValue(result);

		await postLogin(req, res, next);

		expect(authService.userLogin).toHaveBeenCalledWith(req.body);
		expect(helpers.sendResponse).toHaveBeenCalledWith(
			res,
			StatusCodes.OK,
			{ token }
		);
		expect(next).not.toHaveBeenCalled();
	});

	it("should throw InvalidCredentialsError on failed login", async () => {
		const result = { isSuccess: false, message: "Invalid credentials" };
		(authService.userLogin as jest.Mock).mockResolvedValue(result);

		await postLogin(req, res, next);

		expect(authService.userLogin).toHaveBeenCalledWith(req.body);
		expect(next).toHaveBeenCalledWith(
			new InvalidCredentialsError(result.message)
		);
		expect(helpers.sendResponse).not.toHaveBeenCalled();
	});

	it("should call next with error on exception", async () => {
		const error = new Error("Something went wrong");
		(authService.userLogin as jest.Mock).mockRejectedValue(error);

		await postLogin(req, res, next);

		expect(authService.userLogin).toHaveBeenCalledWith(req.body);
		expect(next).toHaveBeenCalledWith(error);
		expect(helpers.sendResponse).not.toHaveBeenCalled();

	});
});

describe("signUp", () => {
	const newUserResponse = "User created successfully";

	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockReq = {};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		mockNext = jest.fn();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		await redisClient.quit();
	});

	it("should create a user and return the success message", async () => {
		(authService.userSignUp as jest.Mock).mockResolvedValue(
			newUserResponse
		);
		mockReq.body = {
			name: "John Doe",
			email: "john@gmail.com",
			password: "password123",
		};

		await signUp(mockReq as Request, mockRes as Response, mockNext);

		expect(authService.userSignUp).toHaveBeenCalledWith(mockReq.body);
		expect(helpers.sendResponse).toHaveBeenCalledWith(
			mockRes,
			StatusCodes.CREATED,
			{
				message: newUserResponse,
			}
		);
	});

	it("should handle errors and call next with the error", async () => {
		const error = new Error("Creation failed");
		(authService.userSignUp as jest.Mock).mockRejectedValue(error);
		mockReq.body = {
			name: "John Doe",
			email: "john@gmail.com",
			password: "password123",
		};

		await signUp(mockReq as Request, mockRes as Response, mockNext);

		expect(mockNext).toHaveBeenCalledWith(error);
	});
});