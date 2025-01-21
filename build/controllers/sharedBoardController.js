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
exports.getAccountsToRenewIptv = exports.getAccounts = exports.reactivateAccount = exports.deleteAccount = exports.updateAccount = exports.addAccount = exports.addSharedBoard = exports.getSharedBoards = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const cryptoHooks_1 = require("../utils/cryptoHooks");
const moment_1 = __importDefault(require("moment"));
const { SharedBoard, Account, Service } = database_1.default;
const getSharedBoards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, email } = req;
        const { page = 1, limit = 10 } = req.query; // Establecer valores predeterminados para la página y el límite
        const offset = (Number(page) - 1) * Number(limit); // Calcular el desplazamiento basado en la página y el límite
        const boards = yield SharedBoard.findAndCountAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userId: userId },
                    {
                        users: {
                            [sequelize_1.Op.contains]: {
                                [`${email}`]: ['VER']
                            }
                        }
                    }
                ],
                deleted_at: { [sequelize_1.Op.is]: null }
            },
            limit: Number(limit),
            offset: Number(offset)
        });
        res.status(200).json({
            total: boards.count,
            boards: boards.rows
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getSharedBoards = getSharedBoards;
const addSharedBoard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        if (!userId)
            throw Error("El usuario no existe");
        const { users, name } = req.body;
        yield SharedBoard.create({
            users: users,
            name: name,
            userId,
        });
        res.status(200).json({ message: "Tablero compartido creado correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.addSharedBoard = addSharedBoard;
const addAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, expiration, service, sharedBoardId, extras } = req.body;
        const sharedBoard = yield SharedBoard.findOne({ where: { id: sharedBoardId } });
        if (!sharedBoard)
            throw new Error('No existe el tablero compartido');
        const newAccount = yield Account.create({
            email: email,
            password: (0, cryptoHooks_1.decryptValue)(password),
            expiration: expiration,
            profiles: 0,
            serviceId: service === null || service === void 0 ? void 0 : service.value,
            userId: sharedBoard.userId,
            sharedBoardId,
            extras
        });
        res.status(200).json(Object.assign(Object.assign({}, newAccount.dataValues), { password: password, service: { name: service === null || service === void 0 ? void 0 : service.label } }));
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.addAccount = addAccount;
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { email, password, expiration, profiles, service, extras } = req.body;
        yield Account.update({
            email: email,
            password: (0, cryptoHooks_1.decryptValue)(password),
            expiration: expiration,
            profiles: profiles,
            serviceId: service === null || service === void 0 ? void 0 : service.value,
            extras,
        }, { where: { id } });
        res.status(200).json({ message: "Cuenta actualizada correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateAccount = updateAccount;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Account.update({ deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss') }, { where: { id } });
        res.status(200).json({ message: "Cuenta eliminada correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteAccount = deleteAccount;
const reactivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Account.update({ deleted_at: null }, { where: { id } });
        res.status(200).json({ message: "Cuenta reactivada correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.reactivateAccount = reactivateAccount;
const getAccounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email, userId } = req;
        const { sharedBoardId } = req.params;
        if (!email || !userId || !sharedBoardId)
            throw new Error('Falta información');
        const doIHaveAccess = yield SharedBoard.findOne({
            where: {
                id: sharedBoardId,
                [sequelize_1.Op.or]: [
                    { userId: userId },
                    {
                        users: {
                            [sequelize_1.Op.contains]: {
                                [`${email}`]: ['VER']
                            }
                        }
                    }
                ],
            }
        });
        if (!doIHaveAccess)
            throw new Error('No tienes acceso a este tablero compartido');
        const { page = 1, limit = 10, search = '', is_deleted, end_date, begin_date } = req.query;
        const order = req.query.order;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = {
            sharedBoardId,
            [sequelize_1.Op.or]: [
                { email: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { password: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ]
        };
        if (is_deleted === 'true') {
            whereClause.deleted_at = { [sequelize_1.Op.not]: null };
        }
        else if (is_deleted === 'false') {
            whereClause.deleted_at = null;
        }
        if (end_date && begin_date) {
            whereClause.expiration = {
                [sequelize_1.Op.between]: [begin_date, end_date]
            };
        }
        else if (end_date) {
            whereClause.expiration = {
                [sequelize_1.Op.lte]: end_date
            };
        }
        else if (begin_date) {
            whereClause.expiration = {
                [sequelize_1.Op.gte]: begin_date
            };
        }
        const accounts = yield Account.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Service,
                    attributes: ['name']
                }
            ],
            order: [...(order === '' || order === undefined) ? [] : [order.split(' ')]],
            limit: Number(limit),
            offset: Number(offset)
        });
        res.status(200).json({
            total: accounts.count,
            accounts: accounts.rows.map(account => (Object.assign(Object.assign({}, account.dataValues), { password: (0, cryptoHooks_1.encryptValue)(account.dataValues.password) }))),
            permissions: userId === doIHaveAccess.userId ? 'admin' : (_a = doIHaveAccess.users) === null || _a === void 0 ? void 0 : _a[email]
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getAccounts = getAccounts;
const getAccountsToRenewIptv = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, userId } = req;
        const { sharedBoardId } = req.params;
        if (!email || !userId || !sharedBoardId)
            throw new Error('Falta información');
        const doIHaveAccess = yield SharedBoard.findOne({
            where: {
                id: sharedBoardId,
                [sequelize_1.Op.or]: [
                    { userId: userId },
                    {
                        users: {
                            [sequelize_1.Op.contains]: {
                                [`${email}`]: ['VER']
                            }
                        }
                    }
                ],
            }
        });
        if (!doIHaveAccess)
            throw new Error('No tienes acceso a este tablero compartido');
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = {
            sharedBoardId,
            [sequelize_1.Op.or]: [
                { email: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { password: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ]
        };
        whereClause.deleted_at = null;
        const accounts = yield Account.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Service,
                    attributes: ['name'],
                    where: {
                        id: 'de24f168-4f18-4a1d-a437-192fa9477df5'
                    }
                }
            ],
            order: [['expiration', 'ASC']],
            limit: Number(limit),
            offset: Number(offset)
        });
        res.status(200).json({
            total: accounts.count,
            accounts: accounts.rows.map(account => (Object.assign(Object.assign({}, account.dataValues), { password: (0, cryptoHooks_1.encryptValue)(account.dataValues.password) }))),
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getAccountsToRenewIptv = getAccountsToRenewIptv;
