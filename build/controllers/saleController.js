"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renewSale = exports.deleteSale = exports.updateSale = exports.getSaleById = exports.addSale = exports.getSales = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const cryptoHooks_1 = require("../utils/cryptoHooks");
const moment_1 = __importDefault(require("moment"));
const { Sale, Account, Service, Client } = database_1.default;
const getSales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const currentDate = (0, moment_1.default)().subtract(3, 'days').format('YYYY-MM-DD'); // Obtener la fecha actual
        const { page = 1, limit = 10, search = '' } = req.query; // Establecer valores predeterminados para la página y el límite
        const offset = (Number(page) - 1) * Number(limit); // Calcular el desplazamiento basado en la página y el límite
        const sales = yield Sale.findAndCountAll({
            where: {
                userId,
                expiration: { [sequelize_1.Op.gte]: currentDate },
                renewed: { [sequelize_1.Op.not]: true },
                [sequelize_1.Op.or]: [
                    { '$client.name$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$client.email$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$client.phone$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$account.email$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$account.password$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$account.service.name$': { [sequelize_1.Op.iLike]: `%${search}%` } }
                ]
            },
            include: [
                {
                    model: Client,
                    attributes: ['name', 'phone', 'email', 'id', 'country'],
                },
                {
                    model: Account,
                    attributes: ['email', 'password', 'id', 'expiration'],
                    include: [
                        {
                            model: Service,
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['expiration', 'ASC']],
            limit: Number(limit),
            offset: Number(offset)
        });
        // Encriptar el campo de contraseña en cada cuenta de usuario
        sales.rows.forEach((sale) => {
            sale.account.password = (0, cryptoHooks_1.encryptValue)(sale.account.password);
        });
        res.status(200).json({
            total: sales.count,
            sales: sales.rows
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSales = getSales;
const addSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { userId } = req;
        if (!userId)
            throw new Error('Falta información');
        const { expiration, account, client, pin, profile, price } = req.body;
        if (!expiration || !account || !client)
            throw Error("Completa la información");
        const newClient = ((_a = client.search) === null || _a === void 0 ? void 0 : _a.label)
            ? yield Client.findByPk((_b = client.search) === null || _b === void 0 ? void 0 : _b.value)
            : yield Client.create({
                name: client.name,
                phone: client.phone,
                email: client.email,
                country: client.country,
                userId,
            });
        if (!newClient)
            throw new Error('No se pudo encontrar el cliente');
        let newAccount = {};
        if ((_c = account === null || account === void 0 ? void 0 : account.email) === null || _c === void 0 ? void 0 : _c.label) {
            newAccount = yield Account.findByPk((_d = account === null || account === void 0 ? void 0 : account.email) === null || _d === void 0 ? void 0 : _d.value, {
                include: [{
                        model: Service,
                        attributes: ['name']
                    }]
            });
        }
        else {
            const temporalAccount = yield Account.create({
                email: (_e = account === null || account === void 0 ? void 0 : account.email) === null || _e === void 0 ? void 0 : _e.value,
                password: (0, cryptoHooks_1.decryptValue)(account === null || account === void 0 ? void 0 : account.password),
                expiration: account === null || account === void 0 ? void 0 : account.expiration,
                profiles: account === null || account === void 0 ? void 0 : account.profiles,
                serviceId: (_f = account === null || account === void 0 ? void 0 : account.service) === null || _f === void 0 ? void 0 : _f.value,
                userId,
            });
            newAccount = yield Account.findByPk(temporalAccount.id, {
                include: [{
                        model: Service,
                        attributes: ['name']
                    }]
            });
        }
        const newSale = yield Sale.create({
            userId,
            price: price !== null && price !== void 0 ? price : 0,
            profile,
            pin,
            expiration,
            accountId: newAccount.id,
            clientId: newClient.id,
        });
        res.status(200).json({
            message: 'Venta registrada con éxito',
            sale: newSale, // Include the newSale details
            account: Object.assign(Object.assign({}, newAccount.dataValues), { password: (0, cryptoHooks_1.encryptValue)(newAccount.password) }), // Include the newAccount details
            client: newClient, // Include the newClient details
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.addSale = addSale;
const getSaleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { id } = req.params;
        const sale = yield Sale.findOne({
            where: { userId, id },
            include: [{
                    model: Client,
                    attributes: ['name', 'phone', 'email'],
                }, {
                    model: Account,
                    attributes: ['email', 'password'],
                }]
        });
        if (!sale)
            throw Error("No se encontró la venta");
        res.status(200).json(sale);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSaleById = getSaleById;
const updateSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { id } = req.params;
        const { expiration, account, client, pin, profile, price } = req.body;
        if (!expiration || !account || !client)
            throw Error("Completa la información");
        const saleToUpdate = yield Sale.findByPk(id);
        if (!saleToUpdate)
            throw Error("No se encontró la venta");
        saleToUpdate.expiration = expiration;
        saleToUpdate.pin = pin;
        saleToUpdate.profile = profile;
        saleToUpdate.price = price !== null && price !== void 0 ? price : saleToUpdate.price;
        let updatedAccount = {};
        if ((_a = account === null || account === void 0 ? void 0 : account.email) === null || _a === void 0 ? void 0 : _a.label) {
            updatedAccount = yield Account.findByPk((_b = account === null || account === void 0 ? void 0 : account.email) === null || _b === void 0 ? void 0 : _b.value, {
                include: [{
                        model: Service,
                        attributes: ['name']
                    }]
            });
        }
        else {
            const temporalAccount = yield Account.create({
                email: (_c = account === null || account === void 0 ? void 0 : account.email) === null || _c === void 0 ? void 0 : _c.value,
                password: (0, cryptoHooks_1.decryptValue)(account === null || account === void 0 ? void 0 : account.password),
                expiration: account === null || account === void 0 ? void 0 : account.expiration,
                profiles: account === null || account === void 0 ? void 0 : account.profiles,
                serviceId: (_d = account === null || account === void 0 ? void 0 : account.service) === null || _d === void 0 ? void 0 : _d.value,
                userId: saleToUpdate.userId,
            });
            updatedAccount = yield Account.findByPk(temporalAccount.id, {
                include: [{
                        model: Service,
                        attributes: ['name']
                    }]
            });
        }
        const updatedClient = ((_e = client.search) === null || _e === void 0 ? void 0 : _e.label)
            ? yield Client.findByPk((_f = client.search) === null || _f === void 0 ? void 0 : _f.value)
            : yield Client.create({
                name: client.name,
                phone: client.phone,
                email: client.email,
                country: client.country,
                userId: saleToUpdate.userId,
            });
        if (!updatedClient)
            throw Error("No se encontró el cliente");
        saleToUpdate.accountId = updatedAccount.id;
        saleToUpdate.clientId = updatedClient.id;
        yield saleToUpdate.save();
        res.status(200).json({
            message: 'Venta actualizada con éxito',
            sale: saleToUpdate,
            account: Object.assign(Object.assign({}, updatedAccount.dataValues), { password: (0, cryptoHooks_1.encryptValue)(updatedAccount.password) }),
            client: updatedClient,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateSale = updateSale;
const deleteSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { id } = req.params;
        const isValid = yield Sale.findAll({ where: { userId, id } });
        if (isValid.length === 0)
            throw Error("No se encontró el ID de la venta");
        yield Sale.destroy({ where: { userId, id } });
        res.status(200).json({ message: "Venta eliminada con exito" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteSale = deleteSale;
const renewSale = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { expiration, pin, profile, price } = req.body;
        // Buscar la venta existente
        const sale = yield Sale.findByPk(id);
        if (!sale)
            throw new Error("La venta no fue encontrada");
        // Actualizar el campo renew en la venta existente
        yield Sale.update({ renewed: true }, { where: { id: id } });
        // Crear una nueva venta basada en los datos de la venta existente
        const newSale = yield Sale.create({
            userId: sale.userId,
            price: price !== null && price !== void 0 ? price : sale.price,
            profile: profile !== null && profile !== void 0 ? profile : sale.profile,
            pin: pin !== null && pin !== void 0 ? pin : sale.pin,
            expiration: expiration !== null && expiration !== void 0 ? expiration : sale.expiration,
            accountId: sale.accountId,
            clientId: sale.clientId,
        });
        res.status(200).json({
            message: 'Venta renovada exitosamente',
            renewedSale: newSale,
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.renewSale = renewSale;
