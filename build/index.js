"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const serviceRouter_1 = __importDefault(require("./routes/serviceRouter"));
const clientRouter_1 = __importDefault(require("./routes/clientRouter"));
const sharedBoardRouter_1 = __importDefault(require("./routes/sharedBoardRouter"));
const accountRouter_1 = __importDefault(require("./routes/accountRouter"));
const saleRouter_1 = __importDefault(require("./routes/saleRouter"));
const botRouter_1 = __importDefault(require("./routes/botRouter"));
const cronJobs_1 = require("./config/cronJobs");
const mailer_1 = require("./config/mailer");
// Variables de entorno
const { URL_FRONT, PORT = 3001 } = process.env;
const app = (0, express_1.default)();
const corOptions = {
    origin: URL_FRONT,
};
// Middlewares
app.use((0, cors_1.default)(corOptions));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
// Routes
app.use('/users', userRouter_1.default);
app.use('/services', serviceRouter_1.default);
app.use('/clients', clientRouter_1.default);
app.use('/sharedBoards', sharedBoardRouter_1.default);
app.use('/accounts', accountRouter_1.default);
app.use('/sales', saleRouter_1.default);
app.use('/bots', botRouter_1.default);
app.use(express_1.default.json());
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
mailer_1.transporter.verify()
    .then(() => console.log('Listo para enviar correos'))
    .catch((err) => console.log(err));
(0, cronJobs_1.initCronJobs)();
