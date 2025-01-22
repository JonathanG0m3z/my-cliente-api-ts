import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface ReminderLogAttributes {
    id: string;
    sent_at: string;
    to: string[];
}

interface ReminderLogCreationAttributes extends Optional<ReminderLogAttributes, 'id'> { }

export default (sequelize: Sequelize) => {
    class ReminderLog extends Model<ReminderLogAttributes, ReminderLogCreationAttributes> implements ReminderLogAttributes {
        public id!: string;
        public sent_at!: string;
        public to!: string[];
    }

    ReminderLog.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            sent_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            to: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'reminderLog',
            timestamps: false,
        }
    );

    return ReminderLog;
};