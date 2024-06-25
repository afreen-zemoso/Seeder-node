import authenticate from "../../middleware/authMiddleware";
import User from "../../models/user";
import { AUTH_MESSAGES, SECRET_KEY } from "../../util/constants";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import * as helpers from "../../util/helpers"; 

jest.mock("../../util/helpers");

jest.mock("jsonwebtoken", () => ({
	...jest.requireActual("jsonwebtoken"), 
	verify: jest.fn().mockReturnValue({ userId: 1 }), 
}));

jest.mock("../../models/user", () => ({
	findByPk: jest.fn(),
}));

describe("authenticate middleware", () => {
    let req: any, res: any, next: any;

	beforeEach(() => {
		req = {
			header: jest.fn().mockReturnValue("Bearer validToken"),
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
	});

    afterEach(() => {
    jest.clearAllMocks();
  });
	const mockUser = { id: 1, email: "testuser@gmail.com" }; // Mock user object

	test("Should respond with 401 for missing token", async () => {
		const req = { header: jest.fn() };

		await authenticate(req, res, next);

		expect(helpers.sendResponse).toHaveBeenCalledWith(
			res,
			StatusCodes.UNAUTHORIZED,
			{
				error: AUTH_MESSAGES.ACCESS_DENIED,
			}
		);
		expect(next).not.toHaveBeenCalled();
	});

	test("Should respond with 401 for invalid token format", async () => {

		await authenticate(req, res, next);
		expect(helpers.sendResponse).toHaveBeenCalledWith(
			res,
			StatusCodes.UNAUTHORIZED,
			{
				error: AUTH_MESSAGES.INVALID_TOKEN,
			}
		);
		expect(next).not.toHaveBeenCalled();
	});

	test("Should respond with 401 for invalid token signature", async () => {
		jest.mock("jsonwebtoken", () => ({
			verify: jest.fn(() => {
				throw new Error("invalid signature");
			}),
		}));

		await authenticate(req, res, next);

		expect(helpers.sendResponse).toHaveBeenCalledWith(
			res,
			StatusCodes.UNAUTHORIZED,
			{
				error: AUTH_MESSAGES.INVALID_TOKEN,
			}
		);
		expect(next).not.toHaveBeenCalled();
	});

	test("Should respond with 401 for valid token but no matching user", async () => {
		jest.mock("../../models/user", () => ({
			findByPk: jest.fn().mockReturnValue(null),
		}));

		await authenticate(req, res, next);

		expect(helpers.sendResponse).toHaveBeenCalledWith(
			res,
			StatusCodes.UNAUTHORIZED,
			{
				error: AUTH_MESSAGES.INVALID_TOKEN,
			}
		);
		expect(next).not.toHaveBeenCalled();
	});
    
    test("should call next if token is valid and user exists", async () => {
        const userId = 1;
        const user = { id: userId, email: "John@gmail.com" };
        (User.findByPk as jest.Mock).mockResolvedValue(
			user
		);

        await authenticate(req, res, next);

        expect(req.header).toHaveBeenCalledWith("Authorization");
        expect(jwt.verify).toHaveBeenCalledWith("validToken", SECRET_KEY);
        expect(User.findByPk).toHaveBeenCalledWith(userId);
        expect(req.user).toEqual(user);
        expect(next).toHaveBeenCalled();
	});
});