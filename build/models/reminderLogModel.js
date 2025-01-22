"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize) => {
    class ReminderLog extends sequelize_1.Model {
    }
    ReminderLog.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        sent_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        to: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'reminderLog',
        timestamps: false,
    });
    return ReminderLog;
};
