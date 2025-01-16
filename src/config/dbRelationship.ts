import { Model, ModelStatic } from 'sequelize';

interface RelationsParams {
    user: ModelStatic<Model>;
    account: ModelStatic<Model>;
    client: ModelStatic<Model>;
    price: ModelStatic<Model>;
    sale: ModelStatic<Model>;
    service: ModelStatic<Model>;
    sharedBoard: ModelStatic<Model>;
}

const relations = ({ user, account, client, price, sale, service, sharedBoard }: RelationsParams): void => {
    /* PRICE RELATIONS */
    service.hasMany(price, { foreignKey: 'serviceId' });
    price.belongsTo(service, { foreignKey: 'serviceId' });

    user.hasMany(price, { foreignKey: 'userId' });
    price.belongsTo(user, { foreignKey: 'userId' });

    /* ACCOUNT RELATIONS */
    service.hasMany(account, { foreignKey: 'serviceId' });
    account.belongsTo(service, { foreignKey: 'serviceId' });

    user.hasMany(account, { foreignKey: 'userId' });
    account.belongsTo(user, { foreignKey: 'userId' });

    /* SALE RELATIONS */
    account.hasMany(sale, { foreignKey: 'accountId' });
    sale.belongsTo(account, { foreignKey: 'accountId' });

    user.hasMany(sale, { foreignKey: 'userId' });
    sale.belongsTo(user, { foreignKey: 'userId' });

    client.hasMany(sale, { foreignKey: 'clientId' });
    sale.belongsTo(client, { foreignKey: 'clientId' });

    /* CLIENT RELATIONS */
    user.hasMany(client, { foreignKey: 'userId' });
    client.belongsTo(user, { foreignKey: 'userId' });

    /* SERVICE RELATIONS */
    user.hasMany(service, { foreignKey: 'userId' });
    service.belongsTo(user, { foreignKey: 'userId' });

    /* SHARED BOARD RELATIONS */
    sharedBoard.hasMany(account, { foreignKey: 'sharedBoardId' });
    account.belongsTo(sharedBoard, { foreignKey: 'sharedBoardId' });

    user.hasMany(sharedBoard, { foreignKey: 'userId' });
    sharedBoard.belongsTo(user, { foreignKey: 'userId' });
};

export default relations;
