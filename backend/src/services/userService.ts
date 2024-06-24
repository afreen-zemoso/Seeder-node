import { UserUpdateBody } from "../interfaces/index";
import User from "../models/user";
import { NotFoundError } from "../errors/NotFoundError";
import { USER_MESSAGES } from "../util/constants";

export const getUserByEmail = async (email: string) => {
	try {
		const user = await User.findOne({
			where: { email },
			attributes: { exclude: ["password"] },
		});
		return user;
	} catch (error) {
		console.error(error);
		throw new NotFoundError(USER_MESSAGES.ERROR_FETCH);
	}
};

export const updateUser = async (userId: string, body: UserUpdateBody) => {
	try {
		await User.update(
			{ ...body },
			{ where: { id: userId }, individualHooks: true }
		);
		return USER_MESSAGES.SUCCESS_UPDATE;
	} catch (err) {
		console.error(err);
		throw new Error(USER_MESSAGES.ERROR_UPDATE);
	}
};

export const getUsers = async () => {
	try {
		const users = await User.findAll();
		return users;
	} catch (err) {
		console.error(err);
		throw new Error(USER_MESSAGES.ERROR_FETCH);
	}
};
