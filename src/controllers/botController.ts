import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import db from "../config/database";
import { decryptValue } from "../utils/cryptoHooks";
import moment from "moment";

const { Account, User, BotExecution } = db;
const { URL_BOTS, IPTV_DISCOUNT } = process.env;
const discount = Number(IPTV_DISCOUNT ?? 0);

const iptvPremiunPriceByMonths: { [key: number]: number } = {
    1: 2,
    1.5: 2,
    2: 4,
    3: 4.5,
    6: 8,
    12: 15
}

export const createIptvPremiunAccount = async (req: PersonalRequest, res: Response) => {
    const { userId } = req;
    const { username, password, demo, months } = req.body;
    const userData: any = await User.findByPk(userId);
    if(!userData || !userId) throw new Error('Falta información');
    const maxDebt = Number(userData.permission?.maxDebt ?? 0);
    const price = iptvPremiunPriceByMonths[months]
    const newBalance = userData.balance - (price - (price * discount / 100))
    if(price && !demo && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
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
    const body = JSON.stringify({ ...req.body, password: pass });
    const newBotExecution = await BotExecution.create({
        userId,
        status: "PROCESO",
        accountId: newAccount.id,
        params: { body }
    })
    try {
        const request = await fetch(`${URL_BOTS}/iptvPremiun`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        })
        await Account.update({
            extras: {request}
        }, { where: { id: newAccount.id } });
        const response = await request.json()
        await Account.update({
            extras: {request, response}
        }, { where: { id: newAccount.id } });
        if (request.ok) {
            if (!demo) {
                await User.update({
                    balance: userData.balance - (price - (price * discount / 100))
                }, { where: { id: userId } });
            }
            await Account.update({
                status: "ACTIVA",
                expiration: moment(response?.exp).format('YYYY-MM-DD')
            }, { where: { id: newAccount.id } });
            await BotExecution.update({
                status: "CREADA",
                response
            }, { where: { id: newBotExecution.id } });
            res.status(200).json(response);
        } else {
            throw new Error(response.message)
        }
    } catch (err: any) {
        await BotExecution.update({
            status: "ERROR",
            response: { error: true, response: { message: err.message, stack: err.stack}, err }
        }, { where: { id: newBotExecution.id } });
        await Account.update({
            status: "ERROR",
            deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, { where: { id: newAccount.id } });
        res.status(400).json({ message: err.message });
    }
};

export const renewIptvPremiunAccount = async (req: PersonalRequest, res: Response) => {
    const { userId } = req;
    const { months, account_id, demo } = req.body;
    const userData: any = await User.findByPk(userId);
    if(!userData || !userId) throw new Error('Falta información');
    const maxDebt = Number(userData.permission?.maxDebt ?? 0);
    const price = iptvPremiunPriceByMonths[months]
    const newBalance = userData.balance - (price - (price * discount / 100))
    if(price && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
        return
    }
    const accountId = decryptValue(account_id)
    const account = await Account.findByPk(accountId);
    const body = JSON.stringify({ username: account?.email, months, demo });
    const newBotExecution = await BotExecution.create({
        userId,
        status: "PROCESO",
        accountId,
        params: { body }
    })
try {
    await Account.update({
        status: "RENOVANDO",
    }, { where: { id: accountId } })
    if (!account) throw new Error('Cuenta no encontrada');
    const request = await fetch(`${URL_BOTS}/iptvPremiun/renew`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    })
    const response = await request.json()
    if (request.ok) {
        if (!demo) {
            await User.update({
                balance: userData.balance - (price - (price * discount / 100))
            }, { where: { id: userId } });
        }
        await Account.update({
            status: "ACTIVA",
            expiration: moment(account.expiration).add(months, 'months').format('YYYY-MM-DD')
        }, { where: { id: accountId } });
        await BotExecution.update({
            status: "RENOVADA",
            response: { error: false, response }
        }, { where: { id: newBotExecution.id } });
        res.status(200).json(response);
    } else {
        throw new Error(response.error || response.message)
    }
} catch (err: any) {
    await BotExecution.update({
        status: "ERROR",
        response: { error: true, response: { message: err.message, stack: err.stack } }
    }, { where: { id: newBotExecution.id } });
    await Account.update({
        status: "ERROR",
    }, { where: { id: accountId } });
    res.status(400).json({ message: err.message });
}
};