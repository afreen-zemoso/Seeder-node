import {
	getUserCashkicks,
	createCashkick,
} from "../../services/cashkickService";
import Cashkick from "../../models/cashkick";
import Cashkick_Contract from "../../models/cashkick_contract";
import User from "../../models/user";
import { CASHKICK_MESSAGES, USER_MESSAGES } from "../../util/constants";
import { Cashkick as CashkickBody, UserCashkick } from "../../interfaces/index";
import { CashkicksStatus } from "../../enums";

jest.mock("../../models/cashkick");
jest.mock("../../models/cashkick_contract");
jest.mock("../../models/user");

describe("Cashkick Service", () => {
	let user = {
		id: "1",
		name: "John Doe",
		email: "john@example.com",
		rate: 12,
		creditBalance: 10000,
		termCap: 12,
	};

	let cashkick = {
		dataValues: {
			id: "1",
			name: "Cashkick 1",
			status: CashkicksStatus.PENDING,
			maturity: new Date(),
			totalReceived: 5000,
			userId: user.id,
		},
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getUserCashkicks", () => {
		it("should return user's cashkicks with total financed", async () => {
			(Cashkick.findAll as jest.Mock).mockResolvedValue([cashkick]);
			(User.findByPk as jest.Mock).mockResolvedValue(user);

			const result = await getUserCashkicks(user.id);

			expect(Cashkick.findAll).toHaveBeenCalledWith({
				where: { userId: user.id },
			});

			expect(User.findByPk).toHaveBeenCalledWith(user.id);
			const userCashkick = cashkick.dataValues;
			const { totalReceived } = userCashkick;
			expect(result).toEqual([
				{
					...userCashkick,
					totalFinanced:
						totalReceived + totalReceived * (user.rate / 100),
				},
			]);
		});

		it("should throw an error when user is not found", async () => {
			(Cashkick.findAll as jest.Mock).mockResolvedValue([cashkick]);
			(User.findByPk as jest.Mock).mockResolvedValue(null);

			await expect(getUserCashkicks(user.id)).rejects.toThrow(
				USER_MESSAGES.ERROR_FETCH
			);

			expect(User.findByPk).toHaveBeenCalledWith(user.id);
		});

		it("should throw an error when fetching cashkicks fails", async () => {
			(User.findByPk as jest.Mock).mockResolvedValue(user);
			(Cashkick.findAll as jest.Mock).mockRejectedValue(
				new Error(CASHKICK_MESSAGES.ERROR_FETCH)
			);

			await expect(getUserCashkicks(user.id)).rejects.toThrow(
				CASHKICK_MESSAGES.ERROR_FETCH
			);
			expect(Cashkick.findAll).toHaveBeenCalledWith({
				where: { userId: user.id },
			});
		});
	});

	describe("createCashkick", () => {
		let cashkickBody: CashkickBody = {
			name: "Cashkick 1",
			status: CashkicksStatus.PENDING,
			maturity: new Date(),
			totalReceived: 5000,
			userId: user.id,
			contracts: ["contract1", "contract2"],
		};

		it("should create a cashkick and return it", async () => {
			(Cashkick.create as jest.Mock).mockResolvedValue(cashkick);
			(User.findByPk as jest.Mock).mockResolvedValue(user);
			(Cashkick_Contract.create as jest.Mock).mockResolvedValue({});
			(User.update as jest.Mock).mockResolvedValue([1]);

			const result = await createCashkick(cashkickBody);

			expect(Cashkick.create).toHaveBeenCalledWith({
				name: cashkickBody.name,
				status: cashkickBody.status,
				maturity: cashkickBody.maturity,
				userId: cashkickBody.userId,
				totalReceived: cashkickBody.totalReceived,
			});
			expect(User.findByPk).toHaveBeenCalledWith(user.id);
			expect(Cashkick_Contract.create).toHaveBeenCalledTimes(2);
			expect(User.update).toHaveBeenCalledWith(
				{
					creditBalance:
						user.creditBalance -
						cashkickBody.totalReceived * (user.rate / 100),
				},
				{ where: { id: user.id } }
			);
			expect(result).toEqual(cashkick);
		});

		it("should throw an error when user is not found", async () => {
			(User.findByPk as jest.Mock).mockResolvedValue(null);

			await expect(createCashkick(cashkickBody)).rejects.toThrow(
				USER_MESSAGES.ERROR_FETCH
			);
		});

		it("should throw an error when cashkick creation fails", async () => {
			(User.findByPk as jest.Mock).mockResolvedValue(user);
			(Cashkick.create as jest.Mock).mockRejectedValue(
				new Error(CASHKICK_MESSAGES.ERROR_ADD)
			);

			await expect(createCashkick(cashkickBody)).rejects.toThrow(
				new Error(CASHKICK_MESSAGES.ERROR_ADD)
			);
			expect(Cashkick.create).toHaveBeenCalledWith({
				name: cashkickBody.name,
				status: cashkickBody.status,
				maturity: cashkickBody.maturity,
				userId: cashkickBody.userId,
				totalReceived: cashkickBody.totalReceived,
			});
		});
	});
});
