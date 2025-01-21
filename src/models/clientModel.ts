import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface ClientAttributes {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    country: string;
    deleted_at?: string | null;
    inactive?: boolean | null;
    userId: string;
}

type ClientCreationAttributes = Optional<ClientAttributes, 'id' | 'phone' | 'email' | 'deleted_at' | 'inactive'>;

class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
    public id!: string;
    public name!: string;
    public phone?: string;
    public email?: string;
    public country!: string;
    public deleted_at?: string | null;
    public inactive?: boolean | null;
    public userId!: string;
}

export default (sequelize: Sequelize): typeof Client => {
    Client.init(
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
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            deleted_at: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
            inactive: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'client',
            timestamps: false,
        }
    );
    return Client;
}
