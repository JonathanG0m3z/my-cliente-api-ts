import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface UserAttributes {
    id: string;
    name: string;
    password: string;
    phone?: string;
    email: string;
    country?: string;
    picture?: string;
    google_account: boolean;
    permission?: object;
    balance?: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'phone' | 'country' | 'picture' | 'permission' | 'balance'> { }

export default (sequelize: Sequelize) => {
    class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
        public id!: string;
        public name!: string;
        public password!: string;
        public phone?: string;
        public email!: string;
        public country?: string;
        public picture?: string;
        public google_account!: boolean;
        public permission?: object;
        public balance?: number;

        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    User.init(
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
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            picture: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            google_account: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            permission: {
                type: DataTypes.JSONB,
                allowNull: true,
            },
            balance: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'User',
        }
    );

    return User;
};