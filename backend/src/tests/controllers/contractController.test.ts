import { Request, Response, NextFunction } from "express";
import {
	getContractsOfUser,
	createContract,
} from "../../../src/controllers/contract";
import * as contractService from "../../../src/services/contractService"; // corrected import path
import redisClient from "../../../src/util/redisClient"; // corrected import path
import { CONTRACT_MESSAGES } from "../../../src/util/constants"; // corrected import path
import { StatusCodes } from "http-status-codes";

// Mocking dependencies
jest.mock("../../../src/services/contractService");
jest.mock("../../../src/util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("Contract Controller", () => {
	const userId = "1";
	const contracts = [{ id: "1", name: "Contract 1" }];
	const newContractResponse = "Contract created successfully";

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

	describe("getContractsOfUser", () => {
		it("should return contracts for a user and cache the result", async () => {
			(contractService.getContractsOfUser as jest.Mock).mockResolvedValue(
				contracts
			);
			mockReq.query = { userId };
			mockReq.originalUrl = `/contracts?userId=${userId}`; // Setting originalUrl properly

			await getContractsOfUser(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(contractService.getContractsOfUser).toHaveBeenCalledWith(
				userId
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/contracts?userId=${userId}`,
				3600,
				JSON.stringify(contracts)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.OK);
			expect(mockRes.json).toHaveBeenCalledWith({
				message: CONTRACT_MESSAGES.SUCCESS_FETCH,
				contracts,
			});
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Fetch failed");
			(contractService.getContractsOfUser as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.query = { userId };
			mockReq.originalUrl = `/contracts?userId=${userId}`; // Setting originalUrl properly

			await getContractsOfUser(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("createContract", () => {
		it("should create a contract and cache the success message", async () => {
			(contractService.createContract as jest.Mock).mockResolvedValue(
				newContractResponse
			);
			mockReq.body = { name: "Contract 1", userId };
			mockReq.originalUrl = `/contracts`; // Setting originalUrl properly

			await createContract(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(contractService.createContract).toHaveBeenCalledWith(
				mockReq.body
			);
			expect(redisClient.setEx).toHaveBeenCalledWith(
				`/contracts`,
				3600,
				JSON.stringify(newContractResponse)
			);
			expect(mockRes.status).toHaveBeenCalledWith(StatusCodes.CREATED);
			expect(mockRes.json).toHaveBeenCalledWith({
				message: newContractResponse,
			});
		});

		it("should handle errors and call next with the error", async () => {
			const error = new Error("Creation failed");
			(contractService.createContract as jest.Mock).mockRejectedValue(
				error
			);
			mockReq.body = { name: "Contract 1", userId };
			mockReq.originalUrl = `/contracts`; // Setting originalUrl properly

			await createContract(
				mockReq as Request,
				mockRes as Response,
				mockNext
			);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
