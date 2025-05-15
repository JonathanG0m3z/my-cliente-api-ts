import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import db from "../config/database";
import { decryptValue } from "../utils/cryptoHooks";
import moment from "moment";
import { isAdmin } from "../utils/isAdmin";
import { Op } from "sequelize";
import { createAccountErrorProcess, renewAccountErrorProcess } from "./webhookController";

const { Account, User, BotExecution, Service } = db;
const { URL_BOTS, IPTV_DISCOUNT } = process.env;
const discount = Number(IPTV_DISCOUNT ?? 0);

const iptvPremiunPriceByMonths: { [key: number]: number } = {
    1: 1.75,
    // 1.5: 1.5,
    2: 2.75,
    3: 3.5,
    6: 6.5,
    12: 12
}

export const createIptvPremiunAccount = async (req: PersonalRequest, res: Response) => {
    const { userId } = req;
    const { username, password, demo, months } = req.body;
    const userData: any = await User.findByPk(userId);
    if (!userData || !userId) throw new Error('Falta información');
    const maxDebt = Number(userData.permission?.maxDebt ?? 0);
    const price = iptvPremiunPriceByMonths[months]
    const newBalance = userData.balance - (price - (price * discount / 100))
    if (price && !demo && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
        return
    }
    const executionsInProcess = await BotExecution.findAll({
        where: { status: "PROCESO", userId, createdAt: { [Op.gte]: moment().subtract(5, 'minutes') } }
    })
    if (executionsInProcess.length > 0) {
        res.status(400).json({ message: 'Tiene ejecuciones en proceso' });
        return
    }
    const pass = decryptValue(password)
    const newAccount = await Account.create({
        email: username,
        status: "CREANDO",
        password: pass,
        expiration: moment().format('YYYY-MM-DD'),
        profiles: 1,
        serviceId: 'de24f168-4f18-4a1d-a437-192fa9477df5',
        sharedBoardId: '2243e6ec-eb5b-456a-931a-9de58fda5af8',
        userId,
        createdInStore: true
    });
    const body = ({ ...req.body, password: pass });
    const bodyString = JSON.stringify(body);
    const newBotExecution = await BotExecution.create({
        userId,
        status: "PROCESO",
        accountId: newAccount.id,
        params: { body: bodyString }
    })
    body.executionId = newBotExecution.id
    try {
        await fetch(`${URL_BOTS}/iptvPremiun`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        res.status(200).json({ message: 'Bot lanzado correctamente' });
    } catch (err: any) {
        await createAccountErrorProcess(newBotExecution.id, newAccount.id ?? '', { response: { message: err.message, stack: err.stack } });
        res.status(400).json({ message: err.message });
    }
};

export const renewIptvPremiunAccount = async (req: PersonalRequest, res: Response) => {
    const { userId } = req;
    const { months, account_id, demo } = req.body;
    const userData: any = await User.findByPk(userId);
    if (!userData || !userId) throw new Error('Falta información');
    const maxDebt = Number(userData.permission?.maxDebt ?? 0);
    const price = iptvPremiunPriceByMonths[months]
    const newBalance = userData.balance - (price - (price * discount / 100))
    if (price && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
        return
    }
    const executionsInProcess = await BotExecution.findAll({
        where: { status: "PROCESO", userId, createdAt: { [Op.gte]: moment().subtract(5, 'minutes') } }
    })
    if (executionsInProcess.length > 0) {
        res.status(400).json({ message: 'Tiene ejecuciones en proceso' });
        return
    }
    const accountId = decryptValue(account_id)
    const account = await Account.findByPk(accountId);
    const body: any = { username: account?.email, months, demo };
    const bodyString = JSON.stringify(body);
    const newBotExecution = await BotExecution.create({
        userId,
        status: "PROCESO",
        accountId,
        params: { body: bodyString }
    })
    body.executionId = newBotExecution.id;
    try {
        await Account.update({
            status: "RENOVANDO",
        }, { where: { id: accountId } })
        if (!account) throw new Error('Cuenta no encontrada');
        await fetch(`${URL_BOTS}/iptvPremiun/renew`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        res.status(200).json({ message: 'Bot lanzado correctamente' });
    } catch (err: any) {
        await renewAccountErrorProcess(newBotExecution.id, accountId ?? '', { response: { message: err.message, stack: err.stack } });
        res.status(400).json({ message: err.message });
    }
};

export const getBotExecutions = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const botExecutions = await BotExecution.findAndCountAll({
            where: { ...isAdmin(userId ?? '') ? {} : { userId } },
            include: [
                {
                    model: Account,
                    attributes: ['email'],
                    include: [{ model: Service, attributes: ['name'] }]
                },
                {
                    model: User,
                    attributes: ['name', 'picture']
                }
            ],
            limit: Number(limit),
            offset: Number(offset),
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({
            total: botExecutions.count,
            botExecutions: botExecutions.rows
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};