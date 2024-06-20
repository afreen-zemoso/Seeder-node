import { Request, Response, NextFunction } from "express";
import cacheMiddleware from "../../middleware/cacheMiddleware";
import redisClient from "../../util/redisClient";

// Mock redisClient
jest.mock("../../util/redisClient", () => ({
	get: jest.fn(),
}));

describe("cacheMiddleware", () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = { originalUrl: "/test-url" };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("should return cached data if it exists in redis", async () => {
		const cachedData = JSON.stringify({ key: "value" });
		(redisClient.get as jest.Mock).mockResolvedValue(cachedData);

		await cacheMiddleware(req as Request, res as Response, next);

		expect(redisClient.get).toHaveBeenCalledWith(req.originalUrl);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(JSON.parse(cachedData));
		expect(next).not.toHaveBeenCalled();
	});

	test("should call next if no cached data exists in redis", async () => {
		(redisClient.get as jest.Mock).mockResolvedValue(null);

		await cacheMiddleware(req as Request, res as Response, next);

		expect(redisClient.get).toHaveBeenCalledWith(req.originalUrl);
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalled();
	});

	test("should call next with an error if redis throws an error", async () => {
		const error = new Error("Redis error");
		(redisClient.get as jest.Mock).mockRejectedValue(error);

		await cacheMiddleware(req as Request, res as Response, next);

		expect(redisClient.get).toHaveBeenCalledWith(req.originalUrl);
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(error);
	});
});
