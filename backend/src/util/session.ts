import session, { SessionOptions } from "express-session";
import SequelizeStore from "connect-session-sequelize";
import sequelize from "./database"; 

let sessionStore: any = null;

export const getSessionStore = () => {
	if (!sessionStore) {
		const SequelizeSessionStore = SequelizeStore(session.Store);
		sessionStore = new SequelizeSessionStore({
			db: sequelize,
		});
	}
	return sessionStore;
};

const sessionConfig: SessionOptions = {
	secret: "my secret",
	resave: false,
	saveUninitialized: false,
	store: getSessionStore(),
};

export default session(sessionConfig);
