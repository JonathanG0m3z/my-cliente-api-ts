import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import userRouter from './routes/userRouter';
import serviceRouter from './routes/serviceRouter';
import clientRouter from './routes/clientRouter';
import sharedBoardRouter from './routes/sharedBoardRouter';
import accountRouter from './routes/accountRouter';
import saleRouter from './routes/saleRouter';
import botRouter from './routes/botRouter';
import webhookRouter from './routes/webhookRouter';
import { initCronJobs } from './config/cronJobs';
import { transporter } from './config/mailer';

// Variables de entorno
const { URL_FRONT, PORT = 3001 } = process.env;

const app = express();

const corOptions: CorsOptions = {
    origin: URL_FRONT,
};

// Middlewares
app.use(cors(corOptions));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Routes

app.use('/users', userRouter);
app.use('/services', serviceRouter);
app.use('/clients', clientRouter);
app.use('/sharedBoards', sharedBoardRouter);
app.use('/accounts', accountRouter);
app.use('/sales', saleRouter);
app.use('/bots', botRouter);
app.use('/webhook', webhookRouter);

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

transporter.verify()
    .then(() => console.log('Listo para enviar correos'))
    .catch((err) => console.log(err))

initCronJobs();