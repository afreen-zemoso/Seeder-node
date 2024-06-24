import { Response, NextFunction } from "express";
import redisClient from "../../util/redisClient";
import { AuthenticatedRequest } from "../../interfaces";
import { STRINGS } from "../../util/constants";
import cacheMiddleware from "../../middleware/cacheMiddleware";

// Mocking redisClient
jest.mock("../../util/redisClient", () => ({
	get: jest.fn(),
}));

describe("cacheMiddleware", () => {
	let mockReq: Partial<AuthenticatedRequest>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockReq = {
			originalUrl: "/some-url",
			query: {},
			user: {
				id: "123",
				name: "john",
				email: "john@gmail.com",
				password: "john@123"
			},
		};
		mockRes = {};
		mockNext = jest.fn();
		jest.clearAllMocks();
	});

	it("should call next if req.user is not defined", async () => {
		mockReq.user = undefined;

		await cacheMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext
		);

		expect(mockNext).toHaveBeenCalled();
	});

	it("should call next and not set req.cachedData if there is no cached data", async () => {
		(redisClient.get as jest.Mock).mockResolvedValue(null);

		await cacheMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext
		);

		expect(redisClient.get).toHaveBeenCalledWith(
			"/some-url123" + STRINGS.CONTRACTS
		);
		expect(mockReq.cachedData).toBeUndefined();
		expect(mockNext).toHaveBeenCalled();
	});

	it("should set req.cachedData if there is cached data", async () => {
		const cachedData = JSON.stringify({ data: "some data" });
		(redisClient.get as jest.Mock).mockResolvedValue(cachedData);

		await cacheMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext
		);

		expect(redisClient.get).toHaveBeenCalledWith(
			"/some-url123" + STRINGS.CONTRACTS
		);
		expect(mockReq.cachedData).toEqual({ data: "some data" });
		expect(mockNext).toHaveBeenCalled();
	});

	it("should log an error and call next if there is an error retrieving data from the cache", async () => {
		const error = new Error("Cache error");
		(redisClient.get as jest.Mock).mockRejectedValue(error);
		console.error = jest.fn();

		await cacheMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext
		);

		expect(console.error).toHaveBeenCalledWith(
			"Error retrieving data from cache:",
			error
		);
		expect(mockNext).toHaveBeenCalled();
	});

	it("should modify the cache key if req.query.userId is not present", async () => {
		mockReq.query = {};

		await cacheMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext
		);

		expect(redisClient.get).toHaveBeenCalledWith(
			"/some-url123" + STRINGS.CONTRACTS
		);
		expect(mockNext).toHaveBeenCalled();
	});

	it("should not modify the cache key if req.query.userId is present", async () => {
		mockReq.query = { userId: "456" };

		await cacheMiddleware(
			mockReq as AuthenticatedRequest,
			mockRes as Response,
			mockNext
		);

		expect(redisClient.get).toHaveBeenCalledWith("/some-url123");
		expect(mockNext).toHaveBeenCalled();
	});
});
