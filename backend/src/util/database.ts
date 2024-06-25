import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import Cashkick from "../models/cashkick";
import Contract from "../models/contract";
import User from "../models/user";
import Cashkick_Contract from "../models/cashkick_contract";

dotenv.config();

const sequelize = new Sequelize({
	database: process.env.DB_NAME as string,
	username: process.env.DB_USER as string,
	password: process.env.DB_PASSWORD as string,
	host: process.env.DB_HOST,
	dialect: "mysql",
	models: [User, Cashkick, Cashkick_Contract, Contract], // Specify models directory
});

export default sequelize;
