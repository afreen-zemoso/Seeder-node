import { Request, Response, NextFunction } from "express";
import {
	getUserCashkicks,
	createCashkick,
} from "../../../src/controllers/cashkick";
import * as cashkickService from "../../services/cashkickService";
import redisClient from "../../util/redisClient";
import { CASHKICK_MESSAGES, STRINGS } from "../../util/constants";
import { StatusCodes } from "http-status-codes";

// Mocking dependencies
jest.mock("../../services/cashkickService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("Cashkick Controller", () => {
	const userId = "1";
	const cashkicks = [{ id: "1", name: "Cashkick 1" }];
	const newCashkickResponse = "Cashkick created successfully";

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

	afterEach(async () => {
		jest.clearAllMocks();
		await redisClient.quit();
	});

	describe("getUserCashkicks", () => {
		it("should return cashkicks for a user and cache the result", async () => {
			(cashkickService.getUserCashkicks as jest.Mock).mockResolvedValue(
				cashkicks
			);
			mockReq.params = { userId };
			mockReq.originalUrl = `/${STRINGS.CASHKICKS}/${userId}`;

			await getUserCashkicks(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(cashkickService.getUserCashkicks).toHaveBeenCalledWith(
				userId
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/${STRINGS.CASHKICKS}/${userId}`,
				3600,
				JSON.stringify(cashkicks)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				message: CASHKICK_MESSAGES.SUCCESS_FETCH,
				cashkicks,
			});
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Fetch failed");
			(cashkickService.getUserCashkicks as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.params = { userId };

			await getUserCashkicks(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("createCashkick", () => {
		it("should create a cashkick and cache the success message", async () => {
			(cashkickService.createCashkick as jest.Mock).mockResolvedValue(
				newCashkickResponse
			);
			mockReq.body = { name: "Cashkick 1", totalReceived: 5000, userId };
			mockReq.originalUrl = `/cashkicks`;

			await createCashkick(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(cashkickService.createCashkick).toHaveBeenCalledWith(
				mockReq.body
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/${STRINGS.CASHKICKS}`,
				3600,
				JSON.stringify(newCashkickResponse)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(mockRes.json).toHaveBeenCalledWith({
				message: newCashkickResponse,
			});
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
