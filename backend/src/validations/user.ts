import { body, param } from "express-validator";
import { VALIDATION_MESSAGES } from "../util/constants";

export const createUserRequestValidation = [
	body("name")
		.trim()
		.isLength({ min: 3 })
		.withMessage(VALIDATION_MESSAGES.ERROR_NAME_REQUIRED),

	body("email")
		.trim()
		.isEmail()
		.withMessage(VALIDATION_MESSAGES.ERROR_INVALID_EMAIL),

	body("password")
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
	param("id")
		.isString()
		.withMessage(VALIDATION_MESSAGES.ERROR_USER_ID_REQUIRED),

	body("password")
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
