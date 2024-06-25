import { Request, Response, NextFunction } from "express";
import * as contractService from "../../services/contractService";
import redisClient from "../../util/redisClient";
import { AUTH_MESSAGES, CONTRACT_MESSAGES } from "../../util/constants";
import { AuthenticatedRequest, Contract } from "../../interfaces";
import { clearCache, getLoggedInUserId, sendResponse } from "../../util/helpers";
import { createContract, getAllContracts, getContractsOfUser } from "../../controllers/contract";


jest.mock("../../services/contractService");
jest.mock("../../util/helpers");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("Contract Controller", () => {
	let req: Partial<AuthenticatedRequest>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		req = {
			cachedData: undefined,
			originalUrl: "/contract",
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

	describe("getContractsOfUser", () => {
		it("should return contracts from cache if available", async () => {
			req.cachedData = [{ name: "Test Contract" }] as Contract[];
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");

			await getContractsOfUser(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, 200, {
				message: CONTRACT_MESSAGES.SUCCESS_FETCH,
				contracts: req.cachedData,
			});
		});

		it("should fetch contracts from service if not cached", async () => {
			const contracts = [{ id: 1, name: "Test Contract" }];
			req.cachedData = undefined;
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");
			(contractService.getContractsOfUser as jest.Mock).mockResolvedValue(
				contracts
			);

			await getContractsOfUser(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(contractService.getContractsOfUser).toHaveBeenCalledWith(
				"123"
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				req.originalUrl + "123",
				3600,
				JSON.stringify(contracts)
			);
			expect(sendResponse).toHaveBeenCalledWith(res, 200, {
				message: CONTRACT_MESSAGES.SUCCESS_FETCH,
				contracts,
			});
		});

		it("should return 401 if user is not authenticated", async () => {
			(getLoggedInUserId as jest.Mock).mockReturnValue(null);

			await getContractsOfUser(
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

	describe("getAllContracts", () => {
		it("should return contracts from cache if available", async () => {
			req.cachedData = [{ name: "Test Contract" }] as Contract[];

			await getAllContracts(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, 200, {
				message: CONTRACT_MESSAGES.SUCCESS_FETCH,
				contracts: req.cachedData,
			});
		});

		it("should fetch contracts from service if not cached", async () => {
			const contracts = [{ id: 1, name: "Test Contract" }];
			req.cachedData = undefined;
			(contractService.getAllContracts as jest.Mock).mockResolvedValue(
				contracts
			);
			(getLoggedInUserId as jest.Mock).mockReturnValue("123");

			await getAllContracts(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(contractService.getAllContracts).toHaveBeenCalled();
			expect(redisClient.setEx).toHaveBeenCalledWith(
				req.originalUrl + "123",
				3600,
				JSON.stringify(contracts)
			);
			expect(sendResponse).toHaveBeenCalledWith(res, 200, {
				message: CONTRACT_MESSAGES.SUCCESS_FETCH,
				contracts,
			});
		});

		it("should handle errors properly", async () => {
			const error = new Error("Service Error");
			req.cachedData = undefined;
			(contractService.getAllContracts as jest.Mock).mockRejectedValue(
				error
			);

			await getAllContracts(
				req as AuthenticatedRequest,
				res as Response,
				next
			);

			expect(next).toHaveBeenCalledWith(error);
			expect(sendResponse).not.toHaveBeenCalled();
		});
	});

	describe("createContract", () => {
		it("should create a new contract", async () => {
			const successMsg = CONTRACT_MESSAGES.SUCCESS_ADD;
			req.body = [{ name: "New Contract", totalValue: 1000 }];
			(contractService.createContract as jest.Mock).mockResolvedValue(
				successMsg
			);

			await createContract(req as Request, res as Response, next);

			expect(contractService.createContract).toHaveBeenCalledWith(
				req.body
			);
			expect(clearCache).toHaveBeenCalled();
			expect(sendResponse).toHaveBeenCalledWith(res, 201, {
				message: successMsg,
			});
		});

		it("should handle service errors", async () => {
			const error = new Error("Service Error");
			req.body = [{ name: "New Contract", totalValue: 1000 }];
			(contractService.createContract as jest.Mock).mockRejectedValue(
				error
			);

			await createContract(req as Request, res as Response, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(sendResponse).not.toHaveBeenCalled();
		});
	});
});
