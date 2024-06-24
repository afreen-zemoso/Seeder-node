import { Request, Response, NextFunction } from "express";
import * as contractService from "../../services/contractService";
import redisClient from "../../util/redisClient";
import { CONTRACT_MESSAGES, STRINGS } from "../../util/constants";
import { AuthenticatedRequest, Contract } from "../../interfaces";
import { StatusCodes } from "http-status-codes";
import { ContractStatus, ContractType } from "../../enums";
import { createContract, getContractsOfUser } from "../../controllers/contract";
import * as helpers from "../../util/helpers";

jest.mock("../../util/helpers");
jest.mock("../../services/contractService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("Contract Controller", () => {
	const userId = "1";
	const contracts: Contract[] = [
		{
			name: "Contract 1",
			status: ContractStatus.SIGNED,
			type: ContractType.MONTHLY,
			perPayment: 0,
			termLength: 0,
			paymentAmount: 0,
		},
	];
	const newContractResponse = "Contract created successfully";

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

	describe("getContractsOfUser", () => {
		it("should return cached contracts if available", async () => {
			mockReq.cachedData = contracts;
			mockReq.originalUrl = `/${STRINGS.CONTRACTS}`;
			mockReq.query = { userId };

			await getContractsOfUser(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(contractService.getContractsOfUser).not.toHaveBeenCalled();
			expect(contractService.getAllContracts).not.toHaveBeenCalled();
			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CONTRACT_MESSAGES.SUCCESS_FETCH,
					contracts,
				}
			);
		});

		it("should return contracts for a user and cache the result if not cached", async () => {
			(contractService.getContractsOfUser as jest.Mock).mockResolvedValue(
				contracts
			);
			mockReq.query = { userId };
			mockReq.originalUrl = `/${STRINGS.CONTRACTS}?userId=${userId}`;
			mockReq.user = {
				id: userId,
				name: "john",
				email: "john@gmail.com",
				password: "john@123",
			};

			await getContractsOfUser(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(contractService.getContractsOfUser).toHaveBeenCalledWith(
				userId
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/${STRINGS.CONTRACTS}?userId=${userId}${userId}`,
				3600,
				JSON.stringify(contracts)
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CONTRACT_MESSAGES.SUCCESS_FETCH,
					contracts,
				}
			);
		});

		it("should return all contracts and cache the result if no userId query and not cached", async () => {
			(contractService.getAllContracts as jest.Mock).mockResolvedValue(
				contracts
			);
			mockReq.query = {};
			mockReq.originalUrl = `/${STRINGS.CONTRACTS}`;
			mockReq.user = {
				id: userId,
				name: "john",
				email: "john@gmail.com",
				password: "john@123",
			};

			await getContractsOfUser(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(contractService.getAllContracts).toHaveBeenCalled();
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/${STRINGS.CONTRACTS}${userId}${STRINGS.CONTRACTS}`,
				3600,
				JSON.stringify(contracts)
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CONTRACT_MESSAGES.SUCCESS_FETCH,
					contracts,
				}
			);
		});

		it("should return contracts without caching if user is not authenticated", async () => {
			(contractService.getContractsOfUser as jest.Mock).mockResolvedValue(
				contracts
			);
			mockReq.query = { userId };
			mockReq.originalUrl = `/${STRINGS.CONTRACTS}?userId=${userId}`;
			mockReq.user = undefined;

			await getContractsOfUser(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(contractService.getContractsOfUser).toHaveBeenCalledWith(
				userId
			);
			expect(redisClient.setEx).not.toHaveBeenCalled();
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.OK,
				{
					message: CONTRACT_MESSAGES.SUCCESS_FETCH,
					contracts,
				}
			);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Fetch failed");
			(contractService.getContractsOfUser as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.query = { userId };

			await getContractsOfUser(
				mockReq as AuthenticatedRequest,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("createContract", () => {
		it("should create a contract and return the success message", async () => {
			(contractService.createContract as jest.Mock).mockResolvedValue(
				newContractResponse
			);
			mockReq.body = { name: "Contract 1", totalReceived: 5000, userId };

			await createContract(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(contractService.createContract).toHaveBeenCalledWith(
				mockReq.body
			);
			expect(helpers.sendResponse).toHaveBeenCalledWith(
				mockRes,
				StatusCodes.CREATED,
				{
					message: newContractResponse,
				}
			);
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Creation failed");
			(contractService.createContract as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.body = { name: "Contract 1", totalReceived: 5000, userId };

			await createContract(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
