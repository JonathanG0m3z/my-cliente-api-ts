"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const { MAILER_HOST, MAILER_USER, MAILER_PASS } = process.env;
exports.transporter = nodemailer_1.default.createTransport({
    host: MAILER_HOST,
    // port: MAILER_PORT,
    secure: true,
    auth: {
        user: MAILER_USER,
        pass: MAILER_PASS
    }
});
