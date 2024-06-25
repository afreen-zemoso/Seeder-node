import { body } from "express-validator";
import { CashkicksStatus } from "../enums";
import { STRINGS, VALIDATION_MESSAGES } from "../util/constants";

export const createCashkickRequestValidation = [
	body(STRINGS.NAME)
		.trim()
		.isLength({ min: 1 })
		.withMessage(VALIDATION_MESSAGES.ERROR_NAME_REQUIRED),

	body(STRINGS.STATUS)
		.notEmpty()
		.withMessage(VALIDATION_MESSAGES.ERROR_STATUS_REQUIRED)
		.isIn(Object.values(CashkicksStatus))
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_STATUS),

	body(STRINGS.MATURITY)
		.notEmpty()
		.withMessage(VALIDATION_MESSAGES.ERROR_MATURITY_REQUIRED)
		.isISO8601()
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_MATURITY),

	body(STRINGS.TOTAL_RECEIVED)
		.notEmpty()
		.isFloat({ min: 0 })
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_AMOUNT),

	body(STRINGS.CONTRACTS)
		.isArray({ min: 1 })
		.withMessage(VALIDATION_MESSAGES.ERROR_CONTRACT_ID_REQUIRED)
		.custom((value) => {
			if (Array.isArray(value)) {
				for (const contractId of value) {
					if (
						typeof contractId !== "string" ||
						contractId.trim().length === 0
					) {
						throw new Error(
							VALIDATION_MESSAGES.ERROR_INVALID_CONTRACT_ID
						);
					}
				}
			}
			return true;
		}),
];
