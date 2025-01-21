"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class Client extends sequelize_1.Model {
}
exports.default = (sequelize) => {
    Client.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        deleted_at: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
        },
        inactive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'client',
        timestamps: false,
    });
    return Client;
};
