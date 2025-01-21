"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class SharedBoard extends sequelize_1.Model {
    }
    SharedBoard.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        users: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: false,
        },
        deleted_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'sharedBoard',
    });
    return SharedBoard;
};
