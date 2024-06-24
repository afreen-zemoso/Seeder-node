import { Cashkick as CashkickBody, UserCashkick } from "../interfaces/index";
import Cashkick from "../models/cashkick";
import Cashkick_Contract from "../models/cashkick_contract";
import User from "../models/user";
import { CASHKICK_MESSAGES, USER_MESSAGES } from "../util/constants";

export const getUserCashkicks = async (userId: string) => {
	try {
		const user = await User.findByPk(userId);
		if (!user) throw new Error(USER_MESSAGES.ERROR_FETCH);

		const cashkicks = await Cashkick.findAll({ where: { userId } });
	
		const userCashkicks: UserCashkick[] = [];
		cashkicks.map((cashkick: Cashkick) => {
			const userCashkick = cashkick.dataValues;
			const { totalReceived } = userCashkick;
			const totalFinanced =
				totalReceived + totalReceived * (user.rate / 100);
			userCashkicks.push({...userCashkick, totalFinanced: totalFinanced })
		})
		return userCashkicks;
	} catch (err: any) {
		if (err.message === USER_MESSAGES.ERROR_FETCH) {
			throw new Error(USER_MESSAGES.ERROR_FETCH);
		} else {
			throw new Error(CASHKICK_MESSAGES.ERROR_FETCH);
		}
	}
};


export const createCashkick = async (body: CashkickBody) => {
	try {
		const {name , status, maturity, totalReceived, userId, contracts } = body;

		const user = await User.findByPk(userId);
		if (!user) throw new Error(USER_MESSAGES.ERROR_FETCH);

		const newCashkick = await Cashkick.create({
			name,
			status,
			maturity,
			userId,
			totalReceived,
		});

		if (contracts && contracts.length > 0 && user) {
			const totalFinanced = totalReceived * (user.rate/100);
			const totalFinancedPerContract =  totalFinanced / contracts.length;
			await Promise.all(
				contracts.map(async (contractId: string) => {
					await Cashkick_Contract.create({
						cashkickId: newCashkick.id,
						contractId: contractId,
						totalFinanced: totalFinancedPerContract,
					});
				})
			);
			await User.update({ creditBalance:  user.creditBalance-totalFinanced}, { where: { id: userId } });

		}
		return newCashkick;
	} catch (err: any) {
		if (err.message === USER_MESSAGES.ERROR_FETCH) {
			throw new Error(USER_MESSAGES.ERROR_FETCH);
		} else {
			throw new Error(CASHKICK_MESSAGES.ERROR_ADD);
		}
	}
};
