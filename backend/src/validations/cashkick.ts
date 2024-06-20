import { body } from "express-validator";
import { CashkicksStatus } from "../enums";
import { VALIDATION_MESSAGES } from "../util/constants";

export const createCashkickRequestValidation = [
	body("name")
		.trim()
		.isLength({ min: 1 })
		.withMessage(VALIDATION_MESSAGES.ERROR_NAME_REQUIRED),

	body("status")
		.notEmpty()
		.withMessage(VALIDATION_MESSAGES.ERROR_STATUS_REQUIRED)
		.isIn(Object.values(CashkicksStatus))
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_STATUS),

	body("maturity")
		.notEmpty()
		.withMessage(VALIDATION_MESSAGES.ERROR_MATURITY_REQUIRED)
		.isISO8601()
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_MATURITY),

	body("totalReceived")
		.notEmpty()
		.isFloat({ min: 0 })
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_AMOUNT),

	body("userId")
		.trim()
		.isUUID()
		.withMessage(VALIDATION_MESSAGES.ERROR_USER_ID_REQUIRED),

	body("contracts")
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
