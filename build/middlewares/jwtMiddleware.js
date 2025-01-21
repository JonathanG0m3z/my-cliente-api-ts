"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cryptoHooks_1 = require("../utils/cryptoHooks");
const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}
const verifyToken = (req, res, next) => {
    const encryptedToken = req.headers.authorization;
    if (!encryptedToken) {
        res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
        return;
    }
    const token = (0, cryptoHooks_1.decryptValue)(encryptedToken);
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
            res.status(401).json({ message: 'Token de autenticación expirado' });
            return;
        }
        // Verificar la firma del token
        jsonwebtoken_1.default.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        // Guardar datos del usuario en la request
        req.userId = decodedToken.id;
        req.email = decodedToken.email;
        // Continuar con el siguiente middleware
        next();
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
};
exports.verifyToken = verifyToken;
