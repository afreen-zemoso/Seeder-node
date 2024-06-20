import { Request, Response, NextFunction } from "express";
import {
	createUser,
	getUserByEmail,
	updateUser,
	getUsers,
} from "../../../src/controllers/user";
import * as userService from "../../services/userService";
import redisClient from "../../util/redisClient";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../../errors/NotFoundError";
import { USER_MESSAGES } from "../../util/constants";

// Mocking dependencies
jest.mock("../../services/userService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("User Controller", () => {
	let mockReq: Partial<Request>;
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

	afterEach(async() => {
		jest.clearAllMocks();
        await redisClient.quit(); 
	});

	describe("createUser", () => {
		it("should create a user and cache the success message", async () => {
			const successMsg = "User created successfully";
			(userService.createUser as jest.Mock).mockResolvedValue(successMsg);
			mockReq.body = { name: "John Doe", email: "john@example.com" };
			mockReq.originalUrl = `/users`;

			await createUser(mockReq as Request, mockRes as Response, mockNext);

			expect(userService.createUser).toHaveBeenCalledWith(mockReq.body);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/users`,
				3600,
				JSON.stringify(successMsg)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(mockRes.json).toHaveBeenCalledWith({ message: successMsg });
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Creation failed");
			(userService.createUser as jest.Mock).mockRejectedValue(error);
			mockReq.body = { name: "John Doe", email: "john@example.com" };

			await createUser(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getUserByEmail", () => {
		it("should return a user by email and cache the result", async () => {
			const user = {
				id: "1",
				name: "John Doe",
				email: "john@example.com",
			};
			(userService.getUserByEmail as jest.Mock).mockResolvedValue(user);
			mockReq.query = { email: "john@example.com" };
			mockReq.originalUrl = `/users?email=john@example.com`;

			await getUserByEmail(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(userService.getUserByEmail).toHaveBeenCalledWith(
				"john@example.com"
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/users?email=john@example.com`,
				3600,
				JSON.stringify(user)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(mockRes.json).toHaveBeenCalledWith(user);
		});

		it("should handle not found error and call next with the error", async () => {
			const error = new NotFoundError(USER_MESSAGES.ERROR_FETCH);
			(userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
			mockReq.query = { email: "john@example.com" };

			await getUserByEmail(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});

		it("should handle missing email query parameter error", async () => {
			mockReq.query = {};

			await getUserByEmail(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(
				new Error("Email query parameter is required")
			);
		});
	});

	describe("updateUser", () => {
		it("should update a user and cache the success message", async () => {
			const successMsg = "User updated successfully";
			(userService.updateUser as jest.Mock).mockResolvedValue(successMsg);
			mockReq.params = { id: "1" };
			mockReq.body = { name: "John Doe Updated" };
			mockReq.originalUrl = `/users/1`;

			await updateUser(mockReq as Request, mockRes as Response, mockNext);

			expect(userService.updateUser).toHaveBeenCalledWith(
				"1",
				mockReq.body
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/users/1`,
				3600,
				JSON.stringify(successMsg)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(mockRes.json).toHaveBeenCalledWith(successMsg);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Update failed");
			(userService.updateUser as jest.Mock).mockRejectedValue(error);
			mockReq.params = { id: "1" };
			mockReq.body = { name: "John Doe Updated" };

			await updateUser(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getUsers", () => {
		it("should return all users and cache the result", async () => {
			const users = [
				{ id: "1", name: "John Doe", email: "john@example.com" },
			];
			(userService.getUsers as jest.Mock).mockResolvedValue(users);
			mockReq.originalUrl = `/users`;

			await getUsers(mockReq as Request, mockRes as Response, mockNext);

			expect(userService.getUsers).toHaveBeenCalled();
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/users`,
				3600,
				JSON.stringify(users)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(mockRes.json).toHaveBeenCalledWith({ users });
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Fetch failed");
			(userService.getUsers as jest.Mock).mockRejectedValue(error);

			await getUsers(mockReq as Request, mockRes as Response, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
