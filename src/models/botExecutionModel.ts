import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface BotExecutionAttributes {
    id: string;
    status: string;
    response?: object | null;
    params?: object | null;
    accountId?: string | null;
    userId: string;
}

interface BotExecutionCreationAttributes extends Optional<BotExecutionAttributes, 'id' | 'response' | 'accountId' | 'params'> { }

export default (sequelize: Sequelize) => {
    class BotExecution extends Model<BotExecutionAttributes, BotExecutionCreationAttributes> implements BotExecutionAttributes {
        public id!: string;
        public status!: string;
        public response!: object | null;
        public params?: object | null;
        public accountId!: string | null;
        public userId!: string;

        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    BotExecution.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            response: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            params: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            accountId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'botExecution',
        }
    );

    return BotExecution;
};