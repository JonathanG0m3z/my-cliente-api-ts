import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface SaleAttributes {
    id: string;
    price: number;
    expiration: string;
    profile?: string | null;
    pin?: string | null;
    renewed?: boolean | null;
    accountId: string;
    userId: string;
    clientId: string;
}

interface SaleCreationAttributes extends Optional<SaleAttributes, 'id' | 'profile' | 'pin' | 'renewed'> { }

export default (sequelize: Sequelize) => {
    class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
        public id!: string;
        public price!: number;
        public expiration!: string;
        public profile?: string | null;
        public pin?: string | null;
        public renewed?: boolean | null;
        public accountId!: string;
        public userId!: string;
        public clientId!: string;

        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    Sale.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            expiration: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            profile: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pin: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            renewed: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            accountId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            clientId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'sale',
            timestamps: true,
        }
    );

    return Sale;
};