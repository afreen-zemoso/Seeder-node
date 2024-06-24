import { UserDetails } from "../interfaces";

declare module "express-serve-static-core" {
	interface Request {
		user?: UserDetails;
		cachedData?: any;
	}
}
