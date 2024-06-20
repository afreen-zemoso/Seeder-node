import { StatusCodes } from "http-status-codes";
import * as authService from "../../services/authService";
import redisClient from "../../util/redisClient";
import { InvalidCredentialsError } from "../../errors/InvalidCredentialsError";
import { postLogin } from "../../controllers/auth";

jest.mock("../../services/authService");
jest.mock("../../util/redisClient", () => ({
	setEx: jest.fn(),
	quit: jest.fn().mockResolvedValue(null),
}));

describe("postLogin", () => {
	let req: any, res: any, next: any;

	beforeEach(() => {
		req = {
			body: { email: "test@example.com", password: "password" },
			originalUrl: "/login",
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};
		next = jest.fn();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		await redisClient.quit(); 
	});


	it("should return 200 and token on successful login", async () => {
		const token = "fake-jwt-token";
		const result = { isSuccess: true, token };
		(authService.userLogin as jest.Mock).mockResolvedValue(result);

		await postLogin(req, res, next);

		expect(authService.userLogin).toHaveBeenCalledWith(req.body);
		expect(redisClient.setEx).toHaveBeenCalledWith(
			req.originalUrl,
			3600,
			JSON.stringify(token)
		);
		expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
		expect(res.json).toHaveBeenCalledWith({ token });
		expect(next).not.toHaveBeenCalled();
	});

	it("should throw InvalidCredentialsError on failed login", async () => {
		const result = { isSuccess: false, message: "Invalid credentials" };
		(authService.userLogin as jest.Mock).mockResolvedValue(result);

		await postLogin(req, res, next);

		expect(authService.userLogin).toHaveBeenCalledWith(req.body);
		expect(next).toHaveBeenCalledWith(
			new InvalidCredentialsError(result.message)
		);
		expect(redisClient.setEx).not.toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});

	it("should call next with error on exception", async () => {
		const error = new Error("Something went wrong");
		(authService.userLogin as jest.Mock).mockRejectedValue(error);

		await postLogin(req, res, next);

		expect(authService.userLogin).toHaveBeenCalledWith(req.body);
		expect(next).toHaveBeenCalledWith(error);
		expect(redisClient.setEx).not.toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
		expect(res.json).not.toHaveBeenCalled();
	});
});
