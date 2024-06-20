import {
	createUser,
	getUserByEmail,
	updateUser,
	getUsers,
} from "../../services/userService";
import User from "../../models/user";
import { USER_MESSAGES } from "../../util/constants";
import { NotFoundError } from "../../errors/NotFoundError";

jest.mock("../../models/user");
jest.mock("../../util/constants");

import { User as UserBody, UserUpdateBody } from "../../interfaces/index";

describe("User Service", () => {
	let user: UserBody = {
		name: "John Doe",
		email: "john@example.com",
		password: "pwd123",
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("createUser", () => {
		it("should create a user and return success message", async () => {
			(User.create as jest.Mock).mockResolvedValue({});
			const result = await createUser(user);

			expect(User.create).toHaveBeenCalledWith({
				...user,
				creditBalance: 10000,
				rate: 12,
				termCap: 12,
			});
			expect(result).toEqual(USER_MESSAGES.SUCCESS_ADD);
		});

		it("should throw an error when user creation fails", async () => {
			(User.create as jest.Mock).mockRejectedValue(
				new Error("Creation failed")
			);

			await expect(createUser(user)).rejects.toThrow(
				USER_MESSAGES.ERROR_ADD
			);
			expect(User.create).toHaveBeenCalledWith({
				...user,
				creditBalance: 10000,
				rate: 12,
				termCap: 12,
			});
		});
	});

	describe("getUserByEmail", () => {
		const userEmail = user.email;
		it("should return a user when found", async () => {
			(User.findOne as jest.Mock).mockResolvedValue(user);

			const result = await getUserByEmail(userEmail);
			expect(result).toEqual(user);
			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: userEmail },
			});
		});

		it("should throw an error when user not found", async () => {
			(User.findOne as jest.Mock).mockRejectedValue(
				new NotFoundError(USER_MESSAGES.ERROR_FETCH)
			);

			await expect(getUserByEmail(userEmail)).rejects.toThrow(
				USER_MESSAGES.ERROR_FETCH
			);
			expect(User.findOne).toHaveBeenCalledWith({
				where: { email: userEmail },
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
				new Error("Update failed")
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
				new Error("Fetch failed")
			);

			await expect(getUsers()).rejects.toThrow(USER_MESSAGES.ERROR_FETCH);
			expect(User.findAll).toHaveBeenCalledTimes(1);
		});
	});
});
