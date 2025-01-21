"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class User extends sequelize_1.Model {
    }
    User.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        country: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        picture: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        google_account: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
        },
        permission: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        balance: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'user',
    });
    return User;
};
