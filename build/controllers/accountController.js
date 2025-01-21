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
exports.renewAccount = exports.deleteAccount = exports.updateAccount = exports.getAccountById = exports.getAccountsCombo = exports.addAccount = exports.getAccounts = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const cryptoHooks_1 = require("../utils/cryptoHooks");
const moment_1 = __importDefault(require("moment"));
const { Sale, Account, Service } = database_1.default;
const getAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const currentDate = (0, moment_1.default)().subtract(5, 'days').format('YYYY-MM-DD'); // Obtener la fecha actual
        const { page = 1, limit = 10 } = req.query; // Establecer valores predeterminados para la página y el límite
        const offset = (Number(page) - 1) * Number(limit); // Calcular el desplazamiento basado en la página y el límite
        const accounts = yield Account.findAndCountAll({
            where: {
                userId,
                expiration: { [sequelize_1.Op.gte]: currentDate },
                deleted_at: { [sequelize_1.Op.is]: null },
                sharedBoardId: { [sequelize_1.Op.is]: null }
            },
            include: [
                {
                    model: Service,
                    attributes: ['name']
                }
            ],
            order: [['expiration', 'ASC']],
            limit: Number(limit),
            offset: Number(offset)
        });
        const accountsList = [];
        // Iterar sobre cada cuenta para agregar el campo profilesAvailable
        for (const account of accounts.rows) {
            const salesCount = yield Sale.count({
                where: {
                    accountId: account.dataValues.id,
                    renewed: { [sequelize_1.Op.not]: true },
                    expiration: { [sequelize_1.Op.gte]: (0, moment_1.default)().format('YYYY-MM-DD') }
                }
            });
            accountsList.push(Object.assign(Object.assign({}, account.dataValues), { profilesAvailable: account.dataValues.profiles - salesCount, password: (0, cryptoHooks_1.encryptValue)(account.password) }));
        }
        res.status(200).json({
            total: accounts.count,
            accounts: accountsList
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getAccounts = getAccounts;
const addAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        if (!userId)
            throw new Error('Falta información');
        const { email, password, expiration, profiles, service } = req.body;
        const newAccount = yield Account.create({
            email: email,
            password: (0, cryptoHooks_1.decryptValue)(password),
            expiration: expiration,
            profiles: profiles,
            serviceId: service === null || service === void 0 ? void 0 : service.value,
            userId,
        });
        res.status(200).json(Object.assign(Object.assign({}, newAccount), { password: password, service: { name: service === null || service === void 0 ? void 0 : service.label } }));
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.addAccount = addAccount;
const getAccountsCombo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { search = '', page = 1, limit = 5 } = req.query;
        const whereCondition = {
            userId,
            expiration: {
                [sequelize_1.Op.gte]: (0, moment_1.default)().subtract(3, 'days')
            },
            deleted_at: { [sequelize_1.Op.is]: null },
            sharedBoardId: { [sequelize_1.Op.is]: null }
        };
        if (search) {
            whereCondition.email = {
                [sequelize_1.Op.iLike]: `%${search}%`
            };
        }
        const offset = (Number(page) - 1) * Number(limit);
        const options = {
            where: whereCondition,
            offset: Number(offset),
            limit: Number(limit),
            include: [
                {
                    model: Service,
                    attributes: ['name']
                }
            ],
        };
        const accounts = yield Account.findAndCountAll(options);
        res.status(200).json({
            total: accounts.count,
            totalPages: Math.ceil(accounts.count / Number(limit)),
            currentPage: page,
            accounts: accounts.rows.map((account) => {
                var _a;
                return ({
                    id: account.id,
                    email: account.email,
                    service_name: (_a = account.service) === null || _a === void 0 ? void 0 : _a.name
                });
            })
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getAccountsCombo = getAccountsCombo;
const getAccountById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId;
        if (!userId)
            throw new Error('Falta información');
        const { id } = req.params;
        const isValid = yield Account.findAll({ where: { userId, id } });
        if (!isValid)
            throw Error("AccountId doesn't exist");
        const account = yield Account.findByPk(id);
        res.status(200).json(account);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getAccountById = getAccountById;
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId } = req;
        const { email, password, expiration, profiles, service } = req.body;
        yield Account.update({
            email: email,
            password: (0, cryptoHooks_1.decryptValue)(password),
            expiration: expiration,
            profiles: profiles,
            serviceId: service === null || service === void 0 ? void 0 : service.value,
            userId,
        }, { where: { userId, id } });
        res.status(200).json({ message: "Cuenta actualizada correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateAccount = updateAccount;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { id } = req.params;
        yield Account.update({ deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') }, { where: { userId, id } });
        res.status(200).json({ message: "Cuenta eliminada correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteAccount = deleteAccount;
const renewAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { password, expiration } = req.body;
        const account = yield Account.findByPk(id);
        if (!account)
            throw new Error("La cuenta no fue encontrada");
        yield Account.update({
            password: (0, cryptoHooks_1.decryptValue)(password),
            expiration: expiration
        }, { where: { id: id } });
        res.status(200).json({
            message: 'Cuenta renovada exitosamente'
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.renewAccount = renewAccount;
