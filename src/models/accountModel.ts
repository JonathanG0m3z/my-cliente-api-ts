import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface AccountAttributes {
    id: string;
    email: string;
    password: string;
    expiration: string;
    profiles: number;
    status?: boolean | null;
    createdInStore?: boolean | null;
    deleted_at?: string | null;
    serviceId: string;
    userId: string;
    sharedBoardId?: string | null;
    extras?: object | null;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'id' | 'deleted_at' | 'status' | 'createdInStore' | 'sharedBoardId' | 'extras'> { }

export default (sequelize: Sequelize) => {
    class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
        public id!: string;
        public email!: string;
        public password!: string;
        public expiration!: string;
        public profiles!: number;
        public status?: boolean | null;
        public createdInStore?: boolean | null;
        public sharedBoardId?: string | null;
        public extras?: object | null;
        public deleted_at?: string | null;
        public userId!: string;
        public serviceId!: string;
    }

    Account.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            expiration: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            profiles: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createdInStore: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            serviceId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            sharedBoardId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            extras: {
                type: DataTypes.JSONB,
                allowNull: true,
            }
        },
        {
            sequelize,
            modelName: 'account',
            timestamps: false,
        }
    );

    return Account;
};