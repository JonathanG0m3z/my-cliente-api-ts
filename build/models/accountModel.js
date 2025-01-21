"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class Account extends sequelize_1.Model {
    }
    Account.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        expiration: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: false,
        },
        profiles: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        createdInStore: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        },
        deleted_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        serviceId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        sharedBoardId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        extras: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'account',
        timestamps: false,
    });
    return Account;
};
