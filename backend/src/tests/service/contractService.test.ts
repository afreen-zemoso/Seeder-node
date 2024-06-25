import { Contract as ContractBody } from "../../interfaces/index";
import Cashkick from "../../models/cashkick";
import Cashkick_Contract from "../../models/cashkick_contract";
import Contract from "../../models/contract";
import { CONTRACT_MESSAGES } from "../../util/constants";
import * as contractService from "../../services/contractService";
import { ContractStatus, ContractType } from "../../enums";

jest.mock("../../models/cashkick");
jest.mock("../../models/cashkick_contract");
jest.mock("../../models/contract");

describe("Contract Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getContractsOfUser", () => {
		it("should return contracts for a user without duplicates", async () => {
			const mockUserId = "user123";
			const mockCashkicks = [
				{
					id: "cashkick1",
					dataValues: {
						contracts: [
							{
								id: "contract1",
								get: jest.fn(() => ({
									id: "contract1",
									data: "data1",
								})),
							},
							{
								id: "contract2",
								get: jest.fn(() => ({
									id: "contract2",
									data: "data2",
								})),
							},
						],
					},
				},
				{
					id: "cashkick2",
					dataValues: {
						contracts: [
							{
								id: "contract1",
								get: jest.fn(() => ({
									id: "contract1",
									data: "data1",
								})),
							},
							{
								id: "contract3",
								get: jest.fn(() => ({
									id: "contract3",
									data: "data3",
								})),
							},
						],
					},
				},
			];

			const mockCashkickContracts = [
				{
					cashkickId: "cashkick1",
					contractId: "contract1",
					totalFinanced: 1000,
				},
				{
					cashkickId: "cashkick1",
					contractId: "contract2",
					totalFinanced: 2000,
				},
				{
					cashkickId: "cashkick2",
					contractId: "contract3",
					totalFinanced: 3000,
				},
			];

			(Cashkick.findAll as jest.Mock).mockResolvedValue(mockCashkicks);
			(Cashkick_Contract.findOne as jest.Mock).mockImplementation(
				({ where }) => {
					const { cashkickId, contractId } = where;
					return Promise.resolve(
						mockCashkickContracts.find(
							(cc) =>
								cc.cashkickId === cashkickId &&
								cc.contractId === contractId
						)
					);
				}
			);

			const contracts = await contractService.getContractsOfUser(
				mockUserId
			);

			expect(Cashkick.findAll).toHaveBeenCalledWith({
				where: { userId: mockUserId },
				include: [
					{
						model: Contract,
						as: expect.any(String),
						through: { attributes: [] },
					},
				],
			});

			expect(Cashkick_Contract.findOne).toHaveBeenCalledTimes(4);
			expect(contracts).toEqual([
				{ id: "contract1", data: "data1", totalFinanced: 1000 },
				{ id: "contract2", data: "data2", totalFinanced: 2000 },
				{ id: "contract3", data: "data3", totalFinanced: 3000 },
			]);
		});

		it("should throw an error if there is a problem fetching user contracts", async () => {
			(Cashkick.findAll as jest.Mock).mockRejectedValue(
				new Error("Database error")
			);

			await expect(
				contractService.getContractsOfUser("user123")
			).rejects.toThrow(CONTRACT_MESSAGES.ERROR_FETCH);
		});
	});

	describe("getAllContracts", () => {
		it("should return all contracts", async () => {
			const mockContracts = [
				{
					name: "Contract 1",
					status: ContractStatus.SIGNED,
					type: ContractType.MONTHLY,
					perPayment: 1000,
					termLength: 5,
					paymentAmount: 2000,
				},
			];
			(Contract.findAll as jest.Mock).mockResolvedValue(mockContracts);

			const contracts = await contractService.getAllContracts();

			expect(Contract.findAll).toHaveBeenCalled();
			expect(contracts).toEqual(mockContracts);
		});

		it("should throw an error if there is a problem fetching all contracts", async () => {
			(Contract.findAll as jest.Mock).mockRejectedValue(new Error("Database error"));

			await expect(contractService.getAllContracts()).rejects.toThrow(
				CONTRACT_MESSAGES.ERROR_FETCH
			);
		});
	});

	describe("createContract", () => {
		const contracts: ContractBody[] = [
			{
				name: "Contract 1",
				status: ContractStatus.SIGNED,
				type: ContractType.MONTHLY,
				perPayment: 1000,
				termLength: 5,
				paymentAmount: 2000,
			},
			{
				name: "Contract 2",
				status: ContractStatus.SIGNED,
				type: ContractType.MONTHLY,
				perPayment: 1200,
				termLength: 7,
				paymentAmount: 2100,
			},
		];

		it("should create contracts and return success message", async () => {
			(Contract.create as jest.Mock).mockResolvedValue({});

			const result = await contractService.createContract(contracts);

			contracts.forEach((contract) => {
				expect(Contract.create).toHaveBeenCalledWith(contract);
			});
			expect(result).toEqual(CONTRACT_MESSAGES.SUCCESS_ADD);
		});

		it("should throw an error when contract creation fails", async () => {
			(Contract.create as jest.Mock).mockRejectedValue(
				new Error(CONTRACT_MESSAGES.ERROR_ADD)
			);

			await expect(contractService.createContract(contracts)).rejects.toThrow(
				CONTRACT_MESSAGES.ERROR_ADD
			);

			contracts.forEach((contract) => {
				expect(Contract.create).toHaveBeenCalledWith(contract);
			});
		});
	});
});
