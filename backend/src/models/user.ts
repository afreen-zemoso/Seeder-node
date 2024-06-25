import { Model, DataType, Table, Column, HasMany, BeforeCreate, BeforeUpdate, BeforeBulkUpdate } from "sequelize-typescript";
import bcrypt from "bcrypt";
import Cashkick from "./cashkick";
import { STRINGS } from "../util/constants";

@Table({
	tableName: STRINGS.USERS,
})
class User extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	id!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	name!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	email!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	password!: string;

	@Column({ type: DataType.DOUBLE, allowNull: false })
	creditBalance!: number;

	@Column({ type: DataType.INTEGER, allowNull: false })
	rate!: number;

	@Column({ type: DataType.INTEGER, allowNull: false })
	termCap!: number;

	@HasMany(() => Cashkick)
	cashkicks!: Cashkick[];

	@BeforeCreate
	@BeforeUpdate
	static async hashPassword(instance: User) {
		if (instance.changed("password")) {
			const salt = await bcrypt.genSalt(10);
			instance.password = await bcrypt.hash(instance.password, salt);
		}
	}

	validPassword(password: string): boolean {
		return bcrypt.compareSync(password, this.password);
	}
}

export default User;
