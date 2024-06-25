import { Model, Table, ForeignKey, Column, DataType } from "sequelize-typescript";
import Cashkick from "./cashkick";
import Contract from "./contract";


@Table({ tableName: "cashkick_contracts" })
class Cashkick_Contract extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	id!: string;

	@ForeignKey(() => Cashkick)
	@Column({ allowNull: false })
	cashkickId!: string;

	@ForeignKey(() => Contract)
	@Column({ allowNull: false })
	contractId!: string;

	@Column({ allowNull: false })
	totalFinanced!: number;
}

export default Cashkick_Contract;
