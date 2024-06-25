import { Request, Response, NextFunction } from "express";
import * as cashkickService from "../../services/cashkickService";
import redisClient from "../../util/redisClient";
import { AUTH_MESSAGES, CASHKICK_MESSAGES } from "../../util/constants";
import { AuthenticatedRequest, UserCashkick } from "../../interfaces";
import { clearCache, getLoggedInUserId, sendResponse } from "../../util/helpers";
import { createCashkick, getUserCashkicks } from "../../controllers/cashkick";


jest.mock("../../services/cashkickService");
jest.mock("../../util/helpers");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("Cashkick Controller", () => {
	let req: Partial<AuthenticatedRequest>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			cachedData: undefined,
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

	describe("getUserCashkicks", () => {
		it("should return cashkicks from cache if available", async () => {
			req.cachedData = [
				{ name: "Test Cashkick" },
			] as UserCashkick[];
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");

			await getUserCashkicks(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, expect.any(Number), {
				message: CASHKICK_MESSAGES.SUCCESS_FETCH,
				cashkicks: req.cachedData,
			});
		});

		it("should fetch cashkicks from service if not cached", async () => {
			const cashkicks = [{ id: 1, name: "Test Cashkick" }];
			req.cachedData = undefined;
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(cashkickService.getUserCashkicks as jest.Mock).mockResolvedValue(
				cashkicks
			);

			await getUserCashkicks(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(cashkickService.getUserCashkicks).toHaveBeenCalledWith(
				"123"
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				req.originalUrl + "123",
				3600,
				JSON.stringify(cashkicks)
			);
			expect(sendResponse).toHaveBeenCalledWith(res, expect.any(Number), {
				message: CASHKICK_MESSAGES.SUCCESS_FETCH,
				cashkicks,
			});
		});

		it("should return 401 if user is not authenticated", async () => {
			(getLoggedInUserId as jest.Mock).mockReturnValue(null);

			await getUserCashkicks(
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

	describe("createCashkick", () => {
		it("should create a new cashkick", async () => {
			const successMsg = CASHKICK_MESSAGES.SUCCESS_ADD;
			req.body = {
				name: "New Cashkick",
				totalReceived: 1000,
				contracts: [],
			};
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(cashkickService.createCashkick as jest.Mock).mockResolvedValue(
				successMsg
			);

			await createCashkick(req as Request, res as Response, next);

			expect(cashkickService.createCashkick).toHaveBeenCalledWith(
				expect.objectContaining({ ...req.body, userId: "123" })
			);
			expect(clearCache).toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, expect.any(Number), {
				message: successMsg,
			});
		});

		it("should return 401 if user is not authenticated", async () => {
			(getLoggedInUserId as jest.Mock).mockReturnValue(null);

			await createCashkick(req as Request, res as Response, next);

			expect(next).toHaveBeenCalledWith(
				new Error(AUTH_MESSAGES.NOT_AUTHENTICATED)
			);
			expect(sendResponse).not.toHaveBeenCalled();
		});

		it("should handle service errors", async () => {
			const error = new Error("Service Error");
			req.body = {
				name: "New Cashkick",
				totalReceived: 1000,
				contracts: [],
			};
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(cashkickService.createCashkick as jest.Mock).mockRejectedValue(
				error
			);

			await createCashkick(req as Request, res as Response, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(sendResponse).not.toHaveBeenCalled();
		});
	});
});
