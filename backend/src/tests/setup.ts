// src/config/test-database.ts
import { Sequelize } from "sequelize-typescript";
import Cashkick from "../models/cashkick";
import Contract from "../models/contract";
import User from "../models/user";
import CashkickContract from "../models/cashkick_contract";

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: ":memory:",
	models: [User, Cashkick, Contract, CashkickContract],
	logging: false,
});

export default sequelize;
