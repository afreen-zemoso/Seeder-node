export const SECRET_KEY = "secret123";

export const routeConstants = {
	USER: "/user",
	CASHKICK: "/cashkick",
	CONTRACT: "/contract",
	PAYMENT: "/payment",
	LOGIN: "/login",
	LOGOUT: "/logout",
};

export const AUTH_MESSAGES = {
	LOGIN_ERROR: "An error occurred while logging in",
	EMAIL_INCORRECT: "Email Id is Incorrect",
	PASSWORD_INCORRECT: "Password is Incorrect",
	ACCESS_DENIED: "Access denied, no token provided",
	INVALID_TOKEN: "Invalid token",
	NOT_AUTHENTICATED: "Not Authenticated"
};
export const CASHKICK_MESSAGES = {
	SUCCESS_FETCH: "Successfully fetched cashkicks",
	SUCCESS_ADD: "Successfully added cashkick",
	SUCCESS_UPDATE: "Successfully updated cashkick",
	SUCCESS_DELETE: "Successfully deleted cashkick",
	ERROR_FETCH: "Error fetching cashkicks",
	ERROR_ADD: "Error adding cashkick",
	ERROR_UPDATE: "Error updating cashkick",
	ERROR_DELETE: "Error deleting cashkick",
	NOT_FOUND: "Cashkick not found",
	INVALID_ID: "Invalid Cashkick ID",
};
export const CONTRACT_MESSAGES = {
	SUCCESS_FETCH: "Successfully fetched contracts",
	SUCCESS_ADD: "Successfully added contracts",
	SUCCESS_UPDATE: "Successfully updated contract",
	SUCCESS_DELETE: "Successfully deleted contract",
	ERROR_FETCH: "Error fetching contracts",
	ERROR_ADD: "Error adding contract",
	ERROR_UPDATE: "Error updating contract",
	ERROR_DELETE: "Error deleting contract",
	NOT_FOUND: "Contract not found",
	INVALID_ID: "Invalid Contract ID",
};

export const USER_MESSAGES = {
	SUCCESS_FETCH: "Successfully fetched users",
	SUCCESS_ADD: "Successfully added user",
	SUCCESS_UPDATE: "Successfully updated user",
	SUCCESS_DELETE: "Successfully deleted user",
	ERROR_FETCH: "Error fetching user",
	ERROR_ADD: "Error adding user",
	ERROR_UPDATE: "Error updating user details",
	ERROR_DELETE: "Error deleting user",
	NOT_FOUND: "User not found",
	INVALID_ID: "Invalid User ID",
	INVALID_EMAIL: "Invalid User Email",
	EMAIL_EXIST: "User with this email already exists",
	INVALID_OLD_PASSWORD:
		"The chosen password is not available. Please choose a different password.",
	REQUIRED_EMAIL: "Email query parameter is required",
};

// src/stringConstants/validationConstants.ts

export const VALIDATION_MESSAGES = {
	ERROR_NAME_REQUIRED: "Name is required and minimum three characters long.",
	ERROR_INVALID_EMAIL: "Invalid email format.",
	ERROR_EMAIL_REQUIRED: "Email is required.",
	ERROR_PASSWORD_REQUIRED: "Password is required.",
	ERROR_PASSWORD_REQUIREMENTS: "Password must meet the required criteria.",
	PASSWORD_REGEX:
		/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/,
	ERROR_CASH_KICK_AMOUNT: "Cash kick amount must be a non-negative integer.",
	ERROR_DUE_DATE_REQUIRED: "Due date is required.",
	ERROR_INVALID_DUE_DATE: "Invalid due date format.",
	ERROR_STATUS_REQUIRED: "Status is required.",
	ERROR_INVALID_STATUS: "Invalid status value.",
	ERROR_EXPECTED_AMOUNT_REQUIRED: "Expected amount is required.",
	ERROR_EXPECTED_AMOUNT_NUMBER: "Expected amount must be a number.",
	ERROR_OUTSTANDING_REQUIRED: "Outstanding amount is required.",
	ERROR_OUTSTANDING_NUMBER: "Outstanding amount must be a number.",
	ERROR_USER_ID_REQUIRED: "User ID is required.",
	ERROR_USER_ID_NUMBER: "User ID must be a number.",
	ERROR_CONTRACT_ID_REQUIRED: "Contract ID is required.",
	ERROR_INVALID_CONTRACT_ID: "Contract ID must be a string.",
	ERROR_MATURITY_REQUIRED: "Maturity date is required.",
	ERROR_INVALID_MATURITY: "Invalid maturity date format.",
	ERROR_INVALID_AMOUNT: "Invalid amount",
	ERROR_TYPE_REQUIRED: "Type is required.",
	ERROR_INVALID_TYPE: "Invalid type value.",
	ERROR_PER_PAYMENT_REQUIRED: "Per payment is required.",
	ERROR_PER_PAYMENT_NUMBER: "Per payment must be a number.",
	ERROR_TERM_LENGTH_REQUIRED: "Term length is required.",
	ERROR_TERM_LENGTH_NUMBER: "Term length must be a number.",
	ERROR_PAYMENT_AMOUNT_REQUIRED: "Payment amount is required.",
	ERROR_PAYMENT_AMOUNT_NUMBER: "Payment amount must be a number.",
};

// Strings used across the application
export const STRINGS = {
	CASHKICKS: "cashkicks",
	CONTRACTS: "contracts",
	USERS: "users",
	NAME: "name",
	STATUS: "status",
	TOTAL_RECEIVED: "totalReceived",
	USER_ID: "userId",
	MATURITY: "maturity",
	TYPE: "type",
	PER_PAYMENT: "perPayment",
	TERM_LENGTH: "termLength",
	PAYMENT_AMOUNT: "paymentAmount",
	EMAIL: "email",
	PASSWORD: "password",
	ID: "id",
	AUTHENTICATION: "Authorization",
	BEARER: "Bearer ",
};

export const ROUTES = {
	LOGIN: "/login",
	SIGNUP: "/signup",
	USER: "/user"
}