import jwt from 'jsonwebtoken';
import User from '../models/user';
import { SECRET_KEY } from '../util/constants';

const authenticate = async (req: any, res: any, next: any) => {
	const token = req.header("Authorization")?.replace("Bearer ", "");
	if (!token) {
		return res
			.status(401)
			.json({ error: "Access denied, no token provided" });
	}
	try {
		const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
		const user = await User.findByPk(decoded.userId);
		if (!user) {
			throw new Error();
		}
		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ error: "Invalid token" });
	}
};
export default authenticate;

