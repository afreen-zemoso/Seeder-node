import { userLogin, userSignUp } from "../../services/authService";
import User from "../../models/user";
import { AUTH_MESSAGES, SECRET_KEY, USER_MESSAGES } from "../../util/constants";
import jwt from "jsonwebtoken";
import { UserDetails as UserBody, LoginRequestBody } from "../../interfaces";
import redisClient from "../../util/redisClient";

jest.mock("../../models/user");
jest.mock("jsonwebtoken");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn(),
}));


describe("Auth Service", () => {
	let loginBody: LoginRequestBody = {
		email: "john@example.com",
		password: "pwd123",
	};

	afterEach(async() => {
		jest.clearAllMocks();
        await redisClient.quit();
	});

	describe("userLogin", () => {
		it("should return success and a token when login is successful", async () => {
			const user = {
				id: "1",
				email: "john@example.com",
				validPassword: jest.fn().mockReturnValue(true),
			};

			(User.findOne as jest.Mock).mockResolvedValue(user);
			(jwt.sign as jest.Mock).mockReturnValue("mocked_token");

			const result = await userLogin(loginBody);

			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: loginBody.email },
			});
			expect(user.validPassword).toHaveBeenCalledWith(loginBody.password);
			expect(jwt.sign).toHaveBeenCalledWith(
				{ userId: user.id },
				SECRET_KEY,
				{ expiresIn: "1h" }
			);
			expect(result).toEqual({ isSuccess: true, token: "mocked_token" });
		});

		it("should return error message when email is incorrect", async () => {
			(User.findOne as jest.Mock).mockResolvedValue(null);

			const result = await userLogin(loginBody);

			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: loginBody.email },
			});
			expect(result).toEqual({
				isSuccess: false,
				message: AUTH_MESSAGES.EMAIL_INCORRECT,
			});
		});

		it("should return error message when password is incorrect", async () => {
			const user = {
				id: "1",
				email: "john@example.com",
				validPassword: jest.fn().mockReturnValue(false),
			};

			(User.findOne as jest.Mock).mockResolvedValue(user);

			const result = await userLogin(loginBody);

			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: loginBody.email },
			});
			expect(user.validPassword).toHaveBeenCalledWith(loginBody.password);
			expect(result).toEqual({
				isSuccess: false,
				message: AUTH_MESSAGES.PASSWORD_INCORRECT,
			});
		});

		it("should throw an error when login process fails", async () => {
			(User.findOne as jest.Mock).mockRejectedValue(
				new Error("Login failed")
			);

			await expect(userLogin(loginBody)).rejects.toThrow(
				AUTH_MESSAGES.LOGIN_ERROR
			);
			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: loginBody.email },
			});
		});
	});
});

describe("signUp", () => {
	let user: UserBody = {
		name: "John Doe",
		email: "john@example.com",
		password: "pwd123",
	};

	afterEach(() => {
		jest.clearAllMocks();
	});
	it("should create a new user signup and return success message", async () => {
		(User.create as jest.Mock).mockResolvedValue({});
		const result = await userSignUp(user);

		expect(User.create).toHaveBeenCalledWith({
			...user,
			creditBalance: 10000,
			rate: 12,
			termCap: 12,
		});
		expect(result).toEqual(USER_MESSAGES.SUCCESS_ADD);
	});

	it("should throw an error when user sign up fails", async () => {
		(User.create as jest.Mock).mockRejectedValue(
			new Error(USER_MESSAGES.ERROR_ADD)
		);

		await expect(userSignUp(user)).rejects.toThrow(USER_MESSAGES.ERROR_ADD);
		expect(User.create).toHaveBeenCalledWith({
			...user,
			creditBalance: 10000,
			rate: 12,
			termCap: 12,
		});
	});
});