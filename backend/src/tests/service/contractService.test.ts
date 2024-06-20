import {
	getContractsOfUser,
	createContract,
} from "../../services/contractService";
import Cashkick from "../../models/cashkick";
import Cashkick_Contract from "../../models/cashkick_contract";
import Contract from "../../models/contract";
import { CONTRACT_MESSAGES } from "../../util/constants";
import { Contract as ContractBody, UserContract } from "../../interfaces/index";
import { contractStatus, contractType } from "../../enums";

jest.mock("../../models/cashkick");
jest.mock("../../models/cashkick_contract");
jest.mock("../../models/contract");

describe("Contract Service", () => {
	const userId = "1";
	const cashkick = {
		id: "1",
		userId: userId,
		dataValues: {
			contracts: [
				{
					id: "1",
					name: "Contract 1",
					get: jest.fn().mockReturnValue({
						id: "1",
						name: "Contract 1",
					}),
				},
			],
		},
	};
	const contract = {
		id: "1",
		name: "Contract 1",
	};
	const cashkickContract = {
		totalFinanced: 1000,
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getContractsOfUser", () => {
		it("should return contracts of the user with total financed", async () => {
			(Cashkick.findAll as jest.Mock).mockResolvedValue([cashkick]);
			(Cashkick_Contract.findOne as jest.Mock).mockResolvedValue(
				cashkickContract
			);

			const result = await getContractsOfUser(userId);

			expect(Cashkick.findAll).toHaveBeenCalledWith({
				where: { userId },
				include: [
					{
						model: Contract,
						as: "contracts",
						through: { attributes: [] },
					},
				],
			});
			expect(Cashkick_Contract.findOne).toHaveBeenCalledWith({
				where: { cashkickId: cashkick.id, contractId: contract.id },
			});
			expect(result).toEqual([
				{
					id: contract.id,
					name: contract.name,
					totalFinanced: cashkickContract.totalFinanced,
				},
			]);
		});

		it("should return all contracts when userId is not provided", async () => {
			(Contract.findAll as jest.Mock).mockResolvedValue([contract]);

			const result = await getContractsOfUser("");

			expect(Contract.findAll).toHaveBeenCalledTimes(1);
			expect(result).toEqual([contract]);
		});

		it("should throw an error when fetching contracts fails", async () => {
			(Cashkick.findAll as jest.Mock).mockRejectedValue(
				new Error("Fetch failed")
			);

			await expect(getContractsOfUser(userId)).rejects.toThrow(
				CONTRACT_MESSAGES.ERROR_FETCH
			);
			expect(Cashkick.findAll).toHaveBeenCalledWith({
				where: { userId },
				include: [
					{
						model: Contract,
						as: "contracts",
						through: { attributes: [] },
					},
				],
			});
		});
	});

	describe("createContract", () => {
		const contracts: ContractBody[] = [
			{
				name: "Contract 1",
				status: contractStatus.SIGNED,
				type: contractType.MONTHLY,
				perPayment: 1000,
				termLength: 5,
				paymentAmount: 2000,
			},
			{
				name: "Contract 2",
				status: contractStatus.SIGNED,
				type: contractType.MONTHLY,
				perPayment: 1200,
				termLength: 7,
				paymentAmount: 2100,
			},
		];

		it("should create contracts and return success message", async () => {
			(Contract.create as jest.Mock).mockResolvedValue({});

			const result = await createContract(contracts);

			contracts.forEach((contract) => {
				expect(Contract.create).toHaveBeenCalledWith(contract);
			});
			expect(result).toEqual(CONTRACT_MESSAGES.SUCCESS_ADD);
		});

		it("should throw an error when contract creation fails", async () => {
			(Contract.create as jest.Mock).mockRejectedValue(
				new Error("Creation failed")
			);

			await expect(createContract(contracts)).rejects.toThrow(
				CONTRACT_MESSAGES.ERROR_ADD
			);

			contracts.forEach((contract) => {
				expect(Contract.create).toHaveBeenCalledWith(contract);
			});
		});
	});
});
