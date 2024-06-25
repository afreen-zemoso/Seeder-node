import { Request, Response, NextFunction } from "express";
import * as userService from "../../services/userService";
import redisClient from "../../util/redisClient";
import { AUTH_MESSAGES, USER_MESSAGES } from "../../util/constants";
import { AuthenticatedRequest } from "../../interfaces";
import { clearCache, getLoggedInUserId, sendResponse } from "../../util/helpers";
import { getUserByEmail, updateUser } from "../../controllers/user";

jest.mock("../../services/userService");
jest.mock("../../util/helpers");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("User Controller", () => {
	let req: Partial<AuthenticatedRequest>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			query: {},
			cachedData: undefined,
			originalUrl: "/user",
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		await redisClient.quit();
	});

	describe("getUserByEmail", () => {
		it("should return 400 if email is not provided", async () => {
			req.query = {};

			await getUserByEmail(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(next).toHaveBeenCalledWith(
				new Error(USER_MESSAGES.REQUIRED_EMAIL)
			);
			expect(sendResponse).not.toHaveBeenCalled();
		});

		it("should return user from cache if available", async () => {
			req.query = { email: "test@example.com" };
			req.cachedData = { id: 1, email: "test@example.com" };
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");

			await getUserByEmail(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, 200, req.cachedData);
		});

		it("should fetch user from service if not cached", async () => {
			const user = { id: 1, email: "test@example.com" };
			req.query = { email: "test@example.com" };
			req.cachedData = undefined;
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(userService.getUserByEmail as jest.Mock).mockResolvedValue(user);

			await getUserByEmail(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(userService.getUserByEmail).toHaveBeenCalledWith(
				"test@example.com"
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				req.originalUrl + "123",
				3600,
				JSON.stringify(user)
			);
			expect(sendResponse).toHaveBeenCalledWith(res, 200, user);
		});

		it("should return 401 if user is not authenticated", async () => {
			req.query = { email: "test@example.com" };
			(getLoggedInUserId as jest.Mock).mockReturnValue(null);

			await getUserByEmail(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(next).toHaveBeenCalledWith(
				new Error(AUTH_MESSAGES.NOT_AUTHENTICATED)
			);
			expect(sendResponse).not.toHaveBeenCalled();
		});
	});

	describe("updateUser", () => {
		it("should update the user and clear cache", async () => {
			const successMsg = USER_MESSAGES.SUCCESS_UPDATE;
			req.body = { name: "Updated User" };
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(userService.updateUser as jest.Mock).mockResolvedValue(successMsg);

			await updateUser(req as Request, res as Response, next);

			expect(userService.updateUser).toHaveBeenCalledWith(
				"123",
				req.body
			);
			expect(clearCache).toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, 200, successMsg);
		});

		it("should return 401 if user is not authenticated", async () => {
			req.body = { name: "Updated User" };
			(getLoggedInUserId as jest.Mock).mockReturnValue(null);

			await updateUser(req as Request, res as Response, next);

			expect(next).toHaveBeenCalledWith(
				new Error(AUTH_MESSAGES.NOT_AUTHENTICATED)
			);
			expect(userService.updateUser).not.toHaveBeenCalled();
			expect(clearCache).not.toHaveBeenCalled();
			expect(sendResponse).not.toHaveBeenCalled();
		});

		it("should handle service errors properly", async () => {
			const error = new Error("Service Error");
			req.body = { name: "Updated User" };
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(userService.updateUser as jest.Mock).mockRejectedValue(error);

			await updateUser(req as Request, res as Response, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(sendResponse).not.toHaveBeenCalled();
		});
	});
});
