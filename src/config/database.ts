import { Sequelize, Options } from 'sequelize';
import moment from 'moment-timezone';
import dbConfig from './dbConfig';
import relations from './dbRelationship';

moment.tz.setDefault('America/Bogota');

const sequelizeOptions: Options = {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
};

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, sequelizeOptions);

sequelize
    .authenticate()
    .then(() => {
        console.log('Connected...');
    })
    .catch((err: Error) => {
        console.error('Error:', err.message);
    });

interface DbInterface {
    Sequelize: typeof Sequelize;
    sequelize: Sequelize;
    User: ReturnType<typeof import('../models/userModel').default>;
    Account: ReturnType<typeof import('../models/accountModel').default>;
    Client: ReturnType<typeof import('../models/clientModel').default>;
    Price: ReturnType<typeof import('../models/priceModel').default>;
    Sale: ReturnType<typeof import('../models/saleModel').default>;
    Service: ReturnType<typeof import('../models/serviceModel').default>;
    ReminderLog: ReturnType<typeof import('../models/reminderLogModel').default>;
    SharedBoard: ReturnType<typeof import('../models/sharedBoardModel').default>;
    BotExecution: ReturnType<typeof import('../models/botExecutionModel').default>;
}

const db: Partial<DbInterface> = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('../models/userModel').default(sequelize, Sequelize);
db.Account = require('../models/accountModel').default(sequelize, Sequelize);
db.Client = require('../models/clientModel').default(sequelize, Sequelize);
db.Price = require('../models/priceModel').default(sequelize, Sequelize);
db.Sale = require('../models/saleModel').default(sequelize, Sequelize);
db.Service = require('../models/serviceModel').default(sequelize, Sequelize);
db.ReminderLog = require('../models/reminderLogModel').default(sequelize, Sequelize);
db.SharedBoard = require('../models/sharedBoardModel').default(sequelize, Sequelize);
db.BotExecution = require('../models/botExecutionModel').default(sequelize, Sequelize);
relations(sequelize.models as any);

db.sequelize
    ?.sync({ alter: true })
    .then(() => {
        console.log('ReSync done!');
    })
    .catch((err: Error) => {
        console.error('Error:', err.message);
    });

export default db as DbInterface;