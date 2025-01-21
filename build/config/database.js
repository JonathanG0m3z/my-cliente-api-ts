"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const dbConfig_1 = __importDefault(require("./dbConfig"));
const dbRelationship_1 = __importDefault(require("./dbRelationship"));
moment_timezone_1.default.tz.setDefault('America/Bogota');
const sequelizeOptions = {
    host: dbConfig_1.default.HOST,
    dialect: dbConfig_1.default.dialect,
    dialectOptions: dbConfig_1.default.dialectOptions,
};
const sequelize = new sequelize_1.Sequelize(dbConfig_1.default.DB, dbConfig_1.default.USER, dbConfig_1.default.PASSWORD, sequelizeOptions);
sequelize
    .authenticate()
    .then(() => {
    console.log('Connected...');
})
    .catch((err) => {
    console.error('Error:', err.message);
});
const db = {};
db.Sequelize = sequelize_1.Sequelize;
db.sequelize = sequelize;
db.User = require('../models/userModel').default(sequelize, sequelize_1.Sequelize);
// db.Account = require('../models/accountModel').default(sequelize, Sequelize);
// db.Client = require('../models/clientModel').default(sequelize, Sequelize);
db.Price = require('../models/priceModel').default(sequelize, sequelize_1.Sequelize);
// db.Sale = require('../models/saleModel').default(sequelize, Sequelize);
db.Service = require('../models/serviceModel').default(sequelize, sequelize_1.Sequelize);
// db.ReminderLog = require('../models/reminderLogModel').default(sequelize, Sequelize);
// db.SharedBoard = require('../models/sharedBoardModel').default(sequelize, Sequelize);
console.log(sequelize.models);
(0, dbRelationship_1.default)(sequelize.models);
(_a = db.sequelize) === null || _a === void 0 ? void 0 : _a.sync({ alter: true }).then(() => {
    console.log('ReSync done!');
}).catch((err) => {
    console.error('Error:', err.message);
});
exports.default = db;
