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
exports.updateBalance = exports.getAdminBalance = exports.getBalanceById = exports.googleAuth = exports.logOut = exports.validateUser = exports.createUser = void 0;
const database_1 = __importDefault(require("../config/database"));
const cryptoHooks_1 = require("../utils/cryptoHooks");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { User } = database_1.default;
const { JWT_SECRET = '' } = process.env;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, password, phone, email, country } = req.body;
        if (!name || !password || !phone || !email || !country)
            throw Error("Error: information incomplete");
        const decryptedPassword = (0, cryptoHooks_1.decryptValue)(password);
        const hashedPassword = yield bcrypt_1.default.hash(decryptedPassword, 12);
        yield User.create({ name, phone, email, password: hashedPassword, google_account: false, country });
        res.status(200).json({
            message: "Usuario creado correctamente",
        });
    }
    catch (error) {
        if (((_a = error.parent) === null || _a === void 0 ? void 0 : _a.code) === 'ER_DUP_ENTRY')
            res.status(400).json({ message: 'Este correo ya se encuentra registrado. Intenta con otro diferente.' });
        else
            res.status(400).json({ message: error.message });
    }
});
exports.createUser = createUser;
const validateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, remember = false } = req.body;
        if (!email || !password)
            throw Error("Error: information incomplete");
        const userDB = yield User.findOne({ where: { email: email } });
        if (userDB === null)
            throw Error("Este correo electrónico no se encuentra registrado");
        if (userDB.google_account)
            throw Error("Este correo electrónico fue registrado por medio de google");
        const decryptedPassword = (0, cryptoHooks_1.decryptValue)(password);
        const isPasswordMatch = yield bcrypt_1.default.compare(decryptedPassword, userDB.password);
        if (isPasswordMatch) {
            const payload = Object.assign(Object.assign({}, userDB.dataValues), { password: null });
            const decryptedToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: remember ? '7d' : '1d' });
            const token = (0, cryptoHooks_1.encryptValue)(decryptedToken);
            res.status(200).json({ token });
        }
        else
            throw Error("Email o contraseña incorrectos");
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.validateUser = validateUser;
const logOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const encryptedToken = req.headers.authorization;
        if (!encryptedToken)
            throw Error("No se proporcionó un token de autenticación");
        res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.logOut = logOut;
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, picture, password } = req.body;
        if (!name || !password || !picture || !email)
            throw Error("Error: information incomplete");
        const decryptedPassword = (0, cryptoHooks_1.decryptValue)(password);
        const hashedPassword = yield bcrypt_1.default.hash(decryptedPassword, 12);
        const userDB = yield User.findOne({ where: { email: email } });
        if (userDB === null) {
            const newUser = yield User.create({ name, phone: undefined, email, password: hashedPassword, google_account: true, picture });
            const payload = Object.assign(Object.assign({}, newUser.dataValues), { password: null });
            const decryptedToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
            const token = (0, cryptoHooks_1.encryptValue)(decryptedToken);
            res.status(200).json({ token });
        }
        else {
            if (userDB.google_account === false)
                throw Error('Esta cuenta fue creada manualmente en la plataforma y no usando Google');
            const isPasswordMatch = yield bcrypt_1.default.compare(decryptedPassword, userDB.password);
            if (isPasswordMatch) {
                const payload = Object.assign(Object.assign({}, userDB.dataValues), { password: null });
                const decryptedToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
                const token = (0, cryptoHooks_1.encryptValue)(decryptedToken);
                res.status(200).json({ token });
            }
            else {
                res.status(400).json({ message: "Hubo un error de comparación con la cuenta existente" });
            }
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.googleAuth = googleAuth;
const getBalanceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req;
        if (!userId)
            throw Error("ID de usuario no proporcionado");
        const userDB = yield User.findByPk(userId);
        if (!userDB)
            throw Error("Información de usuario no encontrada");
        res.status(200).json({ balance: (_a = userDB.balance) !== null && _a !== void 0 ? _a : 0 });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getBalanceById = getBalanceById;
const getAdminBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req;
        const { id } = req.params;
        if (!userId || !id)
            throw Error("Informacion incompleta");
        if (userId !== 'd7887bff-24d2-4e26-b3aa-c2bd18323003')
            throw Error("No tienes permisos para realizar esta operación");
        const userDB = yield User.findByPk(id);
        if (!userDB)
            throw Error("Información de usuario no encontrada");
        res.status(200).json({ balance: (_a = userDB.balance) !== null && _a !== void 0 ? _a : 0 });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getAdminBalance = getAdminBalance;
const updateBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req;
        const { amount, id } = req.body;
        if (userId !== 'd7887bff-24d2-4e26-b3aa-c2bd18323003')
            throw Error("No tienes permisos para realizar esta operación");
        const userDB = yield User.findByPk(id);
        if (!userDB)
            throw Error("Información de usuario no encontrada");
        const newBalance = ((_a = userDB.balance) !== null && _a !== void 0 ? _a : 0) + (amount !== null && amount !== void 0 ? amount : 0);
        yield User.update({
            balance: newBalance
        }, { where: { id } });
        res.status(200).json({ message: "Saldo actualizado con exito" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateBalance = updateBalance;
