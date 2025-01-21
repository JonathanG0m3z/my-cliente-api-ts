"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptValue = exports.encryptValue = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const { CRYPTOJS_SECRET_KEY = '' } = process.env;
const encryptValue = (value) => {
    return crypto_js_1.default.AES.encrypt(value, CRYPTOJS_SECRET_KEY).toString();
};
exports.encryptValue = encryptValue;
const decryptValue = (value) => {
    const decryptedBytes = crypto_js_1.default.AES.decrypt(value.replace('Bearer ', ''), CRYPTOJS_SECRET_KEY);
    const decryptedValue = decryptedBytes.toString(crypto_js_1.default.enc.Utf8);
    return decryptedValue;
};
exports.decryptValue = decryptValue;
