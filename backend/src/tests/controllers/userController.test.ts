import { Request, Response, NextFunction } from "express";

import * as userService from "../../services/userService";
import redisClient from "../../util/redisClient";
import { USER_MESSAGES } from "../../util/constants";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../../interfaces";
import { getUserByEmail, updateUser } from "../../controllers/user";
import * as helpers from "../../util/helpers";

jest.mock("../../util/helpers");
jest.mock("../../services/userService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("User Controller", () => {
	const userId = "1";
	const user = { id: "1", name: "John Doe", email: "john@gmail.com" };
	const updatedUserResponse = "User updated successfully";

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

	describe("getUserByEmail", () => {
		it("should return cached user if available", async () => {
			mockReq.cachedData = user;
			mockReq.query = { email: user.email };
			mockReq.originalUrl = `/users?email=${user.email}`;
			mockReq.user = {
				id: userId,
				name: "john",
				email: "john@gmail.com",
				password: "john@123",
			};

			await getUserByEmail(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(userService.getUserByEmail).not.toHaveBeenCalled();
			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				user
			);
		});

		it("should return user and cache the result if not cached", async () => {
			(userService.getUserByEmail as jest.Mock).mockResolvedValue(user);
			mockReq.query = { email: user.email };
			mockReq.originalUrl = `/users?email=${user.email}`;
			mockReq.user = {
				id: userId,
				name: "john",
				email: "john@gmail.com",
				password: "john@123",
			};

			await getUserByEmail(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(userService.getUserByEmail).toHaveBeenCalledWith(user.email);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/users?email=${user.email}${userId}`,
				3600,
				JSON.stringify(user)
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				user
			);
		});

		it("should throw an error if email is not provided", async () => {
			mockReq.query = {};

			await getUserByEmail(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(
				new Error(USER_MESSAGES.REQUIRED_EMAIL)
			);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Fetch failed");
			(userService.getUserByEmail as jest.Mock).mockRejectedValue(error);
			mockReq.query = { email: user.email };

			await getUserByEmail(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("updateUser", () => {
		it("should update a user and return the success message", async () => {
			(userService.updateUser as jest.Mock).mockResolvedValue(
				updatedUserResponse
			);
			mockReq.params = { id: userId };
			mockReq.body = { name: "John Updated" };

			await updateUser(mockReq as Request, mockRes as Response, mockNext);

			expect(userService.updateUser).toHaveBeenCalledWith(
				userId,
				mockReq.body
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				updatedUserResponse
			);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Update failed");
			(userService.updateUser as jest.Mock).mockRejectedValue(error);
			mockReq.params = { id: userId };
			mockReq.body = { name: "John Updated" };

			await updateUser(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
