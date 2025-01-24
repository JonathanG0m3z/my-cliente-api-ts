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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailReminder = void 0;
const mailer_1 = require("../config/mailer");
const youtubeRenovation_1 = require("../mailTemplates/youtubeRenovation");
const sendEmailReminder = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield mailer_1.transporter.sendMail({
                from: '"Recordatorio MyCliente" <contacto.mycliente@gmail.com>', // sender address
                to: 'jg350u@gmail.com', // correo del cliente
                subject: "Renovación de suscripción", // Asunto
                html: (0, youtubeRenovation_1.youtubeTemplate)(3), // Cuerpo del correo HTML
            });
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    }));
};
exports.sendEmailReminder = sendEmailReminder;
