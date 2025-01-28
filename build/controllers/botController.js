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
exports.renewIptvPremiunAccount = exports.createIptvPremiunAccount = void 0;
const database_1 = __importDefault(require("../config/database"));
const cryptoHooks_1 = require("../utils/cryptoHooks");
const moment_1 = __importDefault(require("moment"));
const { Account, User, BotExecution } = database_1.default;
const { URL_BOTS, IPTV_DISCOUNT } = process.env;
const discount = Number(IPTV_DISCOUNT !== null && IPTV_DISCOUNT !== void 0 ? IPTV_DISCOUNT : 0);
const iptvPremiunPriceByMonths = {
    1: 2,
    2: 4,
    3: 4.5,
    6: 8,
    12: 15
};
const createIptvPremiunAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    const { username, password, demo, months } = req.body;
    const userData = yield User.findByPk(userId);
    if (!userData || !userId)
        throw new Error('Falta información');
    const maxDebt = Number((_b = (_a = userData.permission) === null || _a === void 0 ? void 0 : _a.maxDebt) !== null && _b !== void 0 ? _b : 0);
    const price = iptvPremiunPriceByMonths[months];
    const newBalance = userData.balance - (price - (price * discount / 100));
    if (price && !demo && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
        return;
    }
    const pass = (0, cryptoHooks_1.decryptValue)(password);
    const newAccount = yield Account.create({
        email: username,
        status: "CREANDO",
        password: pass,
        expiration: (0, moment_1.default)().format('YYYY-MM-DD'),
        profiles: 1,
        serviceId: 'de24f168-4f18-4a1d-a437-192fa9477df5',
        sharedBoardId: '2243e6ec-eb5b-456a-931a-9de58fda5af8',
        userId,
        createdInStore: true
    });
    const newBotExecution = yield BotExecution.create({
        userId,
        status: "PROCESO",
        accountId: newAccount.id
    });
    try {
        const request = yield fetch(`${URL_BOTS}/iptvPremiun`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.assign(Object.assign({}, req.body), { password: pass }))
        });
        const response = yield request.json();
        if (request.ok) {
            if (!demo) {
                yield User.update({
                    balance: userData.balance - (price - (price * discount / 100))
                }, { where: { id: userId } });
            }
            yield Account.update({
                status: "ACTIVA",
                expiration: (0, moment_1.default)(response === null || response === void 0 ? void 0 : response.exp).format('YYYY-MM-DD')
            }, { where: { id: newAccount.id } });
            yield BotExecution.update({
                status: "CREADA",
                response
            }, { where: { id: newBotExecution.id } });
            res.status(200).json(response);
        }
        else {
            throw new Error(response.message);
        }
    }
    catch (err) {
        yield BotExecution.update({
            status: "ERROR",
            response: { error: true, response: { message: err.message, stack: err.stack } }
        }, { where: { id: newBotExecution.id } });
        yield Account.update({
            status: "ERROR",
            deleted_at: (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')
        }, { where: { id: newAccount.id } });
        res.status(400).json({ message: err.message });
    }
});
exports.createIptvPremiunAccount = createIptvPremiunAccount;
const renewIptvPremiunAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    const { months, account_id, demo } = req.body;
    const userData = yield User.findByPk(userId);
    if (!userData || !userId)
        throw new Error('Falta información');
    const maxDebt = Number((_b = (_a = userData.permission) === null || _a === void 0 ? void 0 : _a.maxDebt) !== null && _b !== void 0 ? _b : 0);
    const price = iptvPremiunPriceByMonths[months];
    const newBalance = userData.balance - (price - (price * discount / 100));
    if (price && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
        return;
    }
    const accountId = (0, cryptoHooks_1.decryptValue)(account_id);
    const newBotExecution = yield BotExecution.create({
        userId,
        status: "PROCESO",
        accountId
    });
    try {
        yield Account.update({
            status: "RENOVANDO",
        }, { where: { id: accountId } });
        const account = yield Account.findByPk(accountId);
        if (!account)
            throw new Error('Cuenta no encontrada');
        const request = yield fetch(`${URL_BOTS}/iptvPremiun/renew`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: account === null || account === void 0 ? void 0 : account.email, months, demo })
        });
        const response = yield request.json();
        if (request.ok) {
            if (!demo) {
                yield User.update({
                    balance: userData.balance - (price - (price * discount / 100))
                }, { where: { id: userId } });
            }
            yield Account.update({
                status: "ACTIVA",
                expiration: (0, moment_1.default)(account.expiration).add(months, 'months').format('YYYY-MM-DD')
            }, { where: { id: accountId } });
            yield BotExecution.update({
                status: "RENOVADA",
                response: { error: false, response }
            }, { where: { id: newBotExecution.id } });
            res.status(200).json(response);
        }
        else {
            throw new Error(response.error || response.message);
        }
    }
    catch (err) {
        yield BotExecution.update({
            status: "ERROR",
            response: { error: true, response: { message: err.message, stack: err.stack } }
        }, { where: { id: newBotExecution.id } });
        yield Account.update({
            status: "ERROR",
        }, { where: { id: accountId } });
        res.status(400).json({ message: err.message });
    }
});
exports.renewIptvPremiunAccount = renewIptvPremiunAccount;
