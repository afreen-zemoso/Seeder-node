import {
	Model,
	DataType,
	Table,
	Column,
	BelongsToMany,
	AutoIncrement,
	BelongsTo,
	ForeignKey,
} from "sequelize-typescript";
import Contract from "./contract";
import { CashkicksStatus } from "../enums";
import User from "./user";

@Table({
	tableName: "cashkicks",
})
class Cashkick extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	id!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	name!: string;

	@Column({
		type: DataType.ENUM(...Object.values(CashkicksStatus)),
		allowNull: false,
	})
	status!: CashkicksStatus;

	@Column({ type: DataType.DATE, allowNull: false })
	maturity!: Date;

	@Column({ type: DataType.INTEGER, allowNull: false })
	totalReceived!: number;

	@ForeignKey(() => User)
	@Column({ type: DataType.UUID, allowNull: false })
	userId!: string;

	@BelongsTo(() => User)
	user!: User;
	
	// Define a many-to-many relationship between Cashkick and Contract
	@BelongsToMany(
		() => Contract,
		"Cashkick_Contract",
		"cashkickId",
		"contractId"
	)
	contracts?: Contract[];
}

export default Cashkick;
