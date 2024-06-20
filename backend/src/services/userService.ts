import { User as UserBody, UserUpdateBody } from "../interfaces/index";
import User from "../models/user";
import { NotFoundError } from "../errors/NotFoundError";
import { USER_MESSAGES } from "../util/constants";

export const createUser = async (body: UserBody) => {
	try {
		await User.create({
			...body,
			creditBalance: 10000,
			rate: 12,
			termCap: 12,
		});
		return USER_MESSAGES.SUCCESS_ADD;
	} catch (error) {
		console.error(error);
		throw new Error(USER_MESSAGES.ERROR_ADD);
	}
};

export const getUserByEmail = async (email: string) => {
	try {
		const user = await User.findOne({
			where: { email },
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
