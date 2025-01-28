"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class BotExecution extends sequelize_1.Model {
    }
    BotExecution.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        status: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        response: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
        },
        accountId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'botExecution',
    });
    return BotExecution;
};
