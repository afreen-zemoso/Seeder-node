import express from "express";
import bodyParser from "body-parser";
import sequelize from "./util/database";
import userRoutes from "./routes/userRoutes";
import cashkickRoutes from "./routes/cashkickRoutes";
import contractRoutes from "./routes/contractRoutes";
import authRoutes from "./routes/authRoutes";
import SequelizeStore from "connect-session-sequelize";
import errorHandler from "./middleware/errorHandler";
import { routeConstants } from "./util/constants";

const app = express();
const session = require("express-session");

const SequelizeSessionStore = SequelizeStore(session.Store);
const sessionStore = new SequelizeSessionStore({
	db: sequelize,
});

app.use(
	session({
		secret: "my secret",
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
	})
);

app.use(bodyParser.json());

app.use(routeConstants.USER, userRoutes);
app.use(routeConstants.CASHKICK, cashkickRoutes);
app.use(routeConstants.CONTRACT, contractRoutes);
app.use(authRoutes);
app.use(errorHandler);


sequelize.sync()
.then(() => {
    return sessionStore.sync();
  })
.then((result: any) => {
    app.listen(3001);
})
.catch((err: any) => {
    console.log(err);
});

app.listen(3000);
