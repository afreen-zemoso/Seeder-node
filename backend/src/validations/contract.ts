import { body, query } from "express-validator";
import { contractType, contractStatus } from "../enums";
import { STRINGS, VALIDATION_MESSAGES } from "../util/constants";

const validateContractsArray = () => {
	return [
		query(STRINGS.USER_ID)
			.optional()
			.trim()
			.isUUID()
			.withMessage(VALIDATION_MESSAGES.ERROR_USER_ID_REQUIRED),

		body().isArray().withMessage("Contracts should be an array"),

		body(`*.${STRINGS.NAME}`)
			.trim()
			.isLength({ min: 4 })
			.withMessage(VALIDATION_MESSAGES.ERROR_NAME_REQUIRED),

		body(`*.${STRINGS.TYPE}`)
			.notEmpty()
			.withMessage(VALIDATION_MESSAGES.ERROR_TYPE_REQUIRED)
			.isIn(Object.values(contractType))
			.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_TYPE),

		body(`*.${STRINGS.STATUS}`)
			.notEmpty()
			.withMessage(VALIDATION_MESSAGES.ERROR_STATUS_REQUIRED)
			.isIn(Object.values(contractStatus))
			.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_STATUS),

		body(`*.${STRINGS.PER_PAYMENT}`)
			.notEmpty()
			.withMessage(VALIDATION_MESSAGES.ERROR_PER_PAYMENT_REQUIRED)
			.isInt({ min: 0 })
			.withMessage(VALIDATION_MESSAGES.ERROR_PER_PAYMENT_NUMBER),

		body(`*.${STRINGS.TERM_LENGTH}`)
			.notEmpty()
			.withMessage(VALIDATION_MESSAGES.ERROR_TERM_LENGTH_REQUIRED)
			.isInt({ min: 0 })
			.withMessage(VALIDATION_MESSAGES.ERROR_TERM_LENGTH_NUMBER),

		body(`*.${STRINGS.PAYMENT_AMOUNT}`)
			.notEmpty()
			.withMessage(VALIDATION_MESSAGES.ERROR_PAYMENT_AMOUNT_REQUIRED)
			.isInt({ min: 0 })
			.withMessage(VALIDATION_MESSAGES.ERROR_PAYMENT_AMOUNT_NUMBER),
	];
};

export const createContractRequestValidation = validateContractsArray();
