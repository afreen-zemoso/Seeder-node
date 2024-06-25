import { body, param } from "express-validator";
import { STRINGS, VALIDATION_MESSAGES } from "../util/constants";

export const createUserRequestValidation = [
	body(STRINGS.NAME)
		.trim()
		.isLength({ min: 3 })
		.withMessage(VALIDATION_MESSAGES.ERROR_NAME_REQUIRED),

	body(STRINGS.EMAIL)
		.trim()
		.isEmail()
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_EMAIL),

	body(STRINGS.PASSWORD)
		.trim()
		.custom((password) => {
			if (!VALIDATION_MESSAGES.PASSWORD_REGEX.test(password)) {
				throw new Error(
					VALIDATION_MESSAGES.ERROR_PASSWORD_REQUIREMENTS
				);
			}
			return true;
		})
		.withMessage(VALIDATION_MESSAGES.ERROR_PASSWORD_REQUIREMENTS),
];

export const updateUserRequestValidation = [
	param(STRINGS.ID)
		.isString()
		.withMessage(VALIDATION_MESSAGES.ERROR_USER_ID_REQUIRED),

	body(STRINGS.PASSWORD)
		.optional()
		.trim()
		.custom((password) => {
			if (
				password &&
				!VALIDATION_MESSAGES.PASSWORD_REGEX.test(password)
			) {
				throw new Error(
					VALIDATION_MESSAGES.ERROR_PASSWORD_REQUIREMENTS
				);
			}
			return true;
		})
		.withMessage(VALIDATION_MESSAGES.ERROR_PASSWORD_REQUIREMENTS),
];
