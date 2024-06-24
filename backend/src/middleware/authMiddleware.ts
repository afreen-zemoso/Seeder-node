import jwt from 'jsonwebtoken';
import User from '../models/user';
import { AUTH_MESSAGES, SECRET_KEY, STRINGS, USER_MESSAGES } from "../util/constants";
import { sendResponse } from '../util/helpers';

const authenticate = async (req: any, res: any, next: any) => {
	const token = req.header(STRINGS.AUTHENTICATION)?.replace(STRINGS.BEARER, "");
	if (!token) {
        return sendResponse(res, 401, { error: AUTH_MESSAGES.ACCESS_DENIED });
	}
	try {
		const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
		const user = await User.findByPk(decoded.userId);
		if (!user) {
			throw new Error(USER_MESSAGES.NOT_FOUND);
		}
		req.user = user;
		next();
	} catch (error) {
        sendResponse(res, 401, { error: AUTH_MESSAGES.INVALID_TOKEN });
	}
};
export default authenticate;

