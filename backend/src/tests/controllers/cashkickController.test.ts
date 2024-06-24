import { Request, Response, NextFunction } from "express";
import { getUserCashkicks, createCashkick } from "../../controllers/cashkick";
import * as cashkickService from "../../services/cashkickService";
import redisClient from "../../util/redisClient";
import { CASHKICK_MESSAGES } from "../../util/constants";
import { AuthenticatedRequest, UserCashkick } from "../../interfaces";
import { StatusCodes } from "http-status-codes";
import { CashkicksStatus } from "../../enums";
import * as helpers from "../../util/helpers";

jest.mock("../../util/helpers");
jest.mock("../../services/cashkickService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("Cashkick Controller", () => {
	const userId = "1";
	const cashkicks: UserCashkick[] = [{
		name: "Cashkick 1",
		status: CashkicksStatus.PENDING,
		maturity: new Date(),
		totalReceived: 0,
		totalFinanced: 0
	}];
	const newCashkickResponse = "Cashkick created successfully";

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

	describe("getUserCashkicks", () => {
		it("should return cached cashkicks if available", async () => {
			mockReq.cachedData = cashkicks;
			mockReq.params = { userId };

			await getUserCashkicks(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(cashkickService.getUserCashkicks).not.toHaveBeenCalled();
			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CASHKICK_MESSAGES.SUCCESS_FETCH,
					cashkicks,
				}
			);
		});

		it("should return cashkicks for a user and cache the result if not cached", async () => {
			(cashkickService.getUserCashkicks as jest.Mock).mockResolvedValue(
				cashkicks
			);
			mockReq.params = { userId };
			mockReq.originalUrl = `/${userId}`;
			mockReq.user = {
				id: userId,
				name: "john",
				email: "john@gmail.com",
				password: "john@123",
			};

			await getUserCashkicks(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(cashkickService.getUserCashkicks).toHaveBeenCalledWith(
				userId
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/${userId}${userId}`,
				3600,
				JSON.stringify(cashkicks)
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CASHKICK_MESSAGES.SUCCESS_FETCH,
					cashkicks,
				}
			);
		});

		it("should return cashkicks for a user without caching if user is not authenticated", async () => {
			(cashkickService.getUserCashkicks as jest.Mock).mockResolvedValue(
				cashkicks
			);
			mockReq.params = { userId };
			mockReq.originalUrl = `/${userId}`;
			mockReq.user = undefined;

			await getUserCashkicks(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(cashkickService.getUserCashkicks).toHaveBeenCalledWith(
				userId
			);
			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CASHKICK_MESSAGES.SUCCESS_FETCH,
					cashkicks,
				}
			);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Fetch failed");
			(cashkickService.getUserCashkicks as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.params = { userId };

			await getUserCashkicks(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("createCashkick", () => {
		it("should create a cashkick and return the success message", async () => {
			(cashkickService.createCashkick as jest.Mock).mockResolvedValue(
				newCashkickResponse
			);
			mockReq.body = { name: "Cashkick 1", totalReceived: 5000, userId };

			await createCashkick(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(cashkickService.createCashkick).toHaveBeenCalledWith(
				mockReq.body
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.CREATED,
				{
					message: newCashkickResponse,
				}
			);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Creation failed");
			(cashkickService.createCashkick as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.body = { name: "Cashkick 1", totalReceived: 5000, userId };

			await createCashkick(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
