import express from "express";
import bodyParser from "body-parser";
import sequelize from "./util/database";
import userRoutes from "./routes/userRoutes";
import cashkickRoutes from "./routes/cashkickRoutes";
import contractRoutes from "./routes/contractRoutes";
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middleware/errorHandler";
import { routeConstants } from "./util/constants";
import sessionConfig, { getSessionStore } from "./util/session";

const app = express();

app.use(sessionConfig);
app.use(bodyParser.json());
app.use(routeConstants.USER, userRoutes);
app.use(routeConstants.CASHKICK, cashkickRoutes);
app.use(routeConstants.CONTRACT, contractRoutes);
app.use(authRoutes);
app.use(errorHandler);


sequelize.sync()
.then(() => {
    return getSessionStore().sync();
  })
.then((result: any) => {
    app.listen(3001);
})
.catch((err: any) => {
    console.log(err);
});
