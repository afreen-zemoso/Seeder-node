import { Response, NextFunction } from "express";
import redisClient from "../../util/redisClient";
import { AuthenticatedRequest } from "../../interfaces";
import { AUTH_MESSAGES } from "../../util/constants";
import { getLoggedInUserId } from "../../util/helpers";
import cacheMiddleware from "../../middleware/cacheMiddleware";

jest.mock("../../util/helpers");
jest.mock("../../util/redisClient", () => ({
	get: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("cacheMiddleware", () => {
	let req: Partial<AuthenticatedRequest>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			originalUrl: "/api/resource",
			cachedData: undefined,
		};
		res = {};
		next = jest.fn();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		await redisClient.quit();
	});

	it("should throw an error if user is not authenticated", async () => {
		(getLoggedInUserId as jest.Mock).mockReturnValue(null);

		await expect(
			cacheMiddleware(req as AuthenticatedRequest, res as Response, next)
		).rejects.toThrow(AUTH_MESSAGES.NOT_AUTHENTICATED);
		expect(next).not.toHaveBeenCalled();
	});

	it("should set cached data if present in Redis", async () => {
		const userId = "123";
		const cachedData = { data: "cachedData" };
		(getLoggedInUserId as jest.Mock).mockReturnValue(userId);
		(redisClient.get as jest.Mock).mockResolvedValue(
			JSON.stringify(cachedData)
		);

		await cacheMiddleware(
			req as AuthenticatedRequest,
			res as Response,
			next
		);

		expect(redisClient.get).toHaveBeenCalledWith(req.originalUrl + userId);
		expect(req.cachedData).toEqual(cachedData);
		expect(next).toHaveBeenCalled();
	});

	it("should not set cached data if not present in Redis", async () => {
		const userId = "123";
		(getLoggedInUserId as jest.Mock).mockReturnValue(userId);
		(redisClient.get as jest.Mock).mockResolvedValue(null);

		await cacheMiddleware(
			req as AuthenticatedRequest,
			res as Response,
			next
		);

		expect(redisClient.get).toHaveBeenCalledWith(req.originalUrl + userId);
		expect(req.cachedData).toBeUndefined();
		expect(next).toHaveBeenCalled();
	});

	it("should handle errors when retrieving data from Redis", async () => {
		const userId = "123";
		const error = new Error("Redis error");
		(getLoggedInUserId as jest.Mock).mockReturnValue(userId);
		(redisClient.get as jest.Mock).mockRejectedValue(error);
		console.error = jest.fn();

		await cacheMiddleware(
			req as AuthenticatedRequest,
			res as Response,
			next
		);

		expect(redisClient.get).toHaveBeenCalledWith(req.originalUrl + userId);
		expect(console.error).toHaveBeenCalledWith(
			"Error retrieving data from cache:",
			error
		);
		expect(next).toHaveBeenCalled();
	});
});
