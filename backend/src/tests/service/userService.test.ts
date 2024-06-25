import {
	getUserByEmail,
	updateUser,
	getUsers,
} from "../../services/userService";
import User from "../../models/user";
import { USER_MESSAGES } from "../../util/constants";
import { NotFoundError } from "../../errors/NotFoundError";

jest.mock("../../models/user");
jest.mock("../../util/constants");

import { UserDetails as UserBody, UserUpdateBody } from "../../interfaces/index";

describe("User Service", () => {
	let user: UserBody = {
		name: "John Doe",
		email: "john@example.com",
		password: "pwd123",
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getUserByEmail", () => {
		it("should return the user when found", async () => {
			const responseUser = {
				name: "John Doe",
				email: "john@example.com",
			};
			(User.findOne as jest.Mock).mockResolvedValue(responseUser);

			const result = await getUserByEmail("john@example.com");

			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: "john@example.com" },
				attributes: { exclude: ["password"] },
			});
			expect(result).toEqual(responseUser);
		});

		it("should throw a NotFoundError when an error occurs", async () => {
			const error = new Error("Database error");
			(User.findOne as jest.Mock).mockRejectedValue(error);

			await expect(getUserByEmail("john@example.com")).rejects.toThrow(
				NotFoundError
			);
			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: "john@example.com" },
				attributes: { exclude: ["password"] },
			});
		});
	});

	describe("updateUser", () => {
		const updateBody: UserUpdateBody = { password: "pwd123" };
		it("should update a user and return success message", async () => {
			const userId = "1";
			(User.update as jest.Mock).mockResolvedValue([1]);

			const result = await updateUser(userId, updateBody);
			expect(result).toBe(USER_MESSAGES.SUCCESS_UPDATE);
			expect(User.update).toHaveBeenCalledWith(
				{ ...updateBody },
				{ where: { id: userId }, individualHooks: true }
			);
		});

		it("should throw an error when user update fails", async () => {
			(User.update as jest.Mock).mockRejectedValue(
				new Error(USER_MESSAGES.ERROR_UPDATE)
			);

			await expect(updateUser("1", updateBody)).rejects.toThrow(
				USER_MESSAGES.ERROR_UPDATE
			);
			expect(User.update).toHaveBeenCalledWith(updateBody, {
				where: { id: "1" },
				individualHooks: true,
			});
		});
	});

	describe("getUsers", () => {
		it("should return a list of users", async () => {
			(User.findAll as jest.Mock).mockResolvedValue([user]);

			const result = await getUsers();
			expect(result).toEqual([user]);
			expect(User.findAll).toHaveBeenCalledTimes(1);
		});

		it("should throw an error when fetching users fails", async () => {
			(User.findAll as jest.Mock).mockRejectedValue(
				new Error(USER_MESSAGES.ERROR_FETCH+'s')
			);

			await expect(getUsers()).rejects.toThrow(USER_MESSAGES.ERROR_FETCH);
			expect(User.findAll).toHaveBeenCalledTimes(1);
		});
	});
});
