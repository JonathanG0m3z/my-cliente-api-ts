import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

interface ServiceAttributes {
    id: string;
    name: string;
    userId?: string | null;
    deleted_at?: string | null;
}

interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'deleted_at'> { }


class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
    public id!: string;
    public name!: string;
    public userId!: string | null;
    public deleted_at?: string | null;
}

export default (sequelize: Sequelize): typeof Service => {
    Service.init(
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
            userId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'service',
            timestamps: false,
        }
    );
    return Service;
};
