import { Contract as ContractBody } from "../interfaces/index";
import Cashkick from "../models/cashkick";
import Cashkick_Contract from "../models/cashkick_contract";
import Contract from "../models/contract";
import { CONTRACT_MESSAGES } from "../util/constants";

export const getContractsOfUser = async (userId: string) => {
	try {
		if (!userId) {
			return await Contract.findAll();
		}

		const cashkicks = await Cashkick.findAll({
			where: { userId: userId },
			include: [
				{
					model: Contract,
					as: "contracts",
					through: { attributes: [] },
				},
			],
		});
		const contracts: any[] = [];

		for (const cashkick of cashkicks) {
			const cashkickContracts = cashkick.dataValues.contracts;
			for (const contract of cashkickContracts) {
				const cashkicks_contracts = await Cashkick_Contract.findOne({
					where: {
						cashkickId: cashkick.id,
						contractId: contract.id,
					},
				});

				if (cashkicks_contracts) {
					const { Cashkick_Contract, ...contractWithoutAssociation } =
						contract.get({ plain: true });
					contracts.push({
						...contractWithoutAssociation,
						totalFinanced: cashkicks_contracts.totalFinanced,
					});
				}
			}
		}

		return contracts;
	} catch (error) {
		console.error(error);
		throw new Error(CONTRACT_MESSAGES.ERROR_FETCH);
	}
};

export const createContract = async (contracts: ContractBody[]) => {
	try {
		await Promise.all(
			contracts.map(async (contract) => {
				await Contract.create({
					...contract,
				});
			})
		);

		return CONTRACT_MESSAGES.SUCCESS_ADD;
	} catch (err) {
		console.error(err);
		throw new Error(CONTRACT_MESSAGES.ERROR_ADD);
	}
};
