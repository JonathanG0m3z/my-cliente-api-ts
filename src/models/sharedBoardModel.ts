import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface SharedBoardAttributes {
    id: string;
    name: string;
    users: object;
    deleted_at?: string | null;
    userId: string;
}

interface SharedBoardCreationAttributes extends Optional<SharedBoardAttributes, 'id' | 'deleted_at'> { }

export default (sequelize: Sequelize) => {
    class SharedBoard extends Model<SharedBoardAttributes, SharedBoardCreationAttributes> implements SharedBoardAttributes {
        public id!: string;
        public name!: string;
        public users!: object;
        public deleted_at?: string | null;
        public userId!: string;

        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    SharedBoard.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            users: {
                type: DataTypes.JSONB,
                allowNull: false,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'sharedBoard',
        }
    );

    return SharedBoard;
};