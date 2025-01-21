"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Price extends sequelize_1.Model {
}
exports.default = (sequelize) => {
    Price.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        price: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        serviceId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'price',
        timestamps: false,
    });
    return Price;
};
