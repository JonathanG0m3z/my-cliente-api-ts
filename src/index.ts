import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';
import userRouter from './routes/userRouter';
import serviceRouter from './routes/serviceRouter';
import clientRouter from './routes/clientRouter';
import sharedBoardRouter from './routes/sharedBoardRouter';

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

app.use(express.json());

app.get('/ping', (_, res) => {
    res.send('pong');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});