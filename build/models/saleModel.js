"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class Sale extends sequelize_1.Model {
    }
    Sale.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        price: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        expiration: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
        },
        profile: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        pin: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        renewed: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        },
        accountId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        clientId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'sale',
        timestamps: true,
    });
    return Sale;
};
