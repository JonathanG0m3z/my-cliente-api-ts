import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Define los atributos del modelo
interface PriceAttributes {
    id: string;
    price: number;
    userId: string;
    // serviceId: string;
}

// Define los atributos opcionales para la creación de instancias
interface PriceCreationAttributes extends Optional<PriceAttributes, 'id'> { }

// Define el modelo extendiendo de `Model`
class Price extends Model<PriceAttributes, PriceCreationAttributes> implements PriceAttributes {
    public id!: string;
    public price!: number;
    public userId!: string;
    // public serviceId!: string;
}

export default (sequelize: Sequelize): typeof Price => {
    Price.init(
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
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            // serviceId: {
            //     type: DataTypes.UUID,
            //     allowNull: false,
            // },
        },
        {
            sequelize,
            modelName: 'price',
            timestamps: false,
        }
    );
    return Price;
};
