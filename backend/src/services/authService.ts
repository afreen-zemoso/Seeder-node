import { UserDetails as UserBody, LoginRequestBody } from "../interfaces";
import User from "../models/user";
import { AUTH_MESSAGES, SECRET_KEY, USER_MESSAGES } from "../util/constants";
import jwt from "jsonwebtoken";

export const userLogin = async (body: LoginRequestBody) => {
    const { email, password } = body;
	try {
		const user = await User.findOne({ where: { email } });
		if(!user){
			return {isSuccess: false, message: AUTH_MESSAGES.EMAIL_INCORRECT}
		}
		if (!user.validPassword(password)) {
            return {isSuccess: false, message: AUTH_MESSAGES.PASSWORD_INCORRECT};
		}
		const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
			expiresIn: "1h",
		});
        return { isSuccess: true, token };
	} catch (error) {
		console.error(error);
		throw new Error(AUTH_MESSAGES.LOGIN_ERROR);
	}
};


export const userSignUp = async (body: UserBody) => {
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
