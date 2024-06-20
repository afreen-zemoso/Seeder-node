import { LoginRequestBody } from "../interfaces";
import User from "../models/user";
import { AUTH_MESSAGES, SECRET_KEY } from "../util/constants";
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
