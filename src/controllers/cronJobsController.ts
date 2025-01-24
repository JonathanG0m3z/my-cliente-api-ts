import { transporter } from "../config/mailer";
import { youtubeTemplate } from "../mailTemplates/youtubeRenovation";

export const sendEmailReminder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await transporter.sendMail({
                from: '"Recordatorio MyCliente" <contacto.mycliente@gmail.com>', // sender address
                to: 'jg350u@gmail.com', // correo del cliente
                subject: "Renovación de suscripción", // Asunto
                html: youtubeTemplate(3), // Cuerpo del correo HTML
            });
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
};