import { Model, DataType, Table, Column, BelongsToMany, ForeignKey, BelongsTo, AutoIncrement } from "sequelize-typescript";
import Cashkick from "./cashkick";
import User from "./user";
import { contractStatus, contractType } from "../enums";
import { STRINGS } from "../util/constants";

@Table({
	tableName: STRINGS.CONTRACTS,
})
class Contract extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	id!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	name!: string;

	@Column({
		type: DataType.ENUM(...Object.values(contractStatus)),
		allowNull: false,
	})
	status!: contractStatus;

	@Column({
		type: DataType.ENUM(...Object.values(contractType)),
		allowNull: false,
	})
	type!: contractType;

	@Column({ type: DataType.INTEGER, allowNull: false })
	perPayment!: number;

	@Column({ type: DataType.INTEGER, allowNull: false })
	termLength!: number;

	@Column({ type: DataType.INTEGER, allowNull: false })
	paymentAmount!: number;

	@BelongsToMany(
		() => Cashkick,
		"Cashkick_Contract",
		"contractId",
		"cashkickId"
	)
	cashkicks?: Cashkick[];
}

export default Contract;
