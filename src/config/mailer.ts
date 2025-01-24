import nodemailer from 'nodemailer'

const { MAILER_HOST, MAILER_USER, MAILER_PASS } = process.env;

export const transporter = nodemailer.createTransport({
    host: MAILER_HOST,
    // port: MAILER_PORT,
    secure: true,
    auth: {
        user: MAILER_USER,
        pass: MAILER_PASS
    }
})