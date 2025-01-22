import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import db from "../config/database";
import { decryptValue } from "../utils/cryptoHooks";
import moment from "moment";

const { Account, User } = db;
const { URL_BOTS, IPTV_DISCOUNT } = process.env;
const discount = Number(IPTV_DISCOUNT ?? 0);

const iptvPremiunPriceByMonths: { [key: number]: number } = {
    1: 2,
    2: 4,
    3: 4.5,
    6: 8,
    12: 15
}

export const createLattvAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { username, password, demo, months } = req.body;
        if (!userId) throw new Error('Falta información');
        const pass = decryptValue(password)
        const newAccount = await Account.create({
            email: username,
            status: "CREANDO",
            password: pass,
            expiration: demo ? moment().format('YYYY-MM-DD') : moment().add(months, 'months').format('YYYY-MM-DD'),
            profiles: 1,
            serviceId: '4738f953-da82-4a15-aa52-c3cffd1e26d9',
            sharedBoardId: '2243e6ec-eb5b-456a-931a-9de58fda5af8',
            userId,
            createdInStore: true
        });
        const request = await fetch(`${URL_BOTS}/lattv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...req.body, password: pass })
        })
        const response = await request.json()
        if (request.ok) {
            await Account.update({
                status: "ACTIVA",
            }, { where: { id: newAccount.id } });
            res.status(200).json(response);
        } else {
            await Account.update({
                status: "ERROR",
            }, { where: { id: newAccount.id } });
            throw new Error(response.message)
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const createIptvPremiunAccount = async (req: PersonalRequest, res: Response) => {
    const { userId } = req;
    const { username, password, demo, months } = req.body;
    const userData: any = await User.findByPk(userId);
    if(!userData || !userId) throw new Error('Falta información');
    const maxDebt = Number(userData.permission?.maxDebt ?? 0);
    const price = iptvPremiunPriceByMonths[months]
    const newBalance = userData.balance - (price - (price * discount / 100))
    if(price && (newBalance < maxDebt)) {
        res.status(400).json({ message: 'DEUDA MÁXIMA ALCANZADA' });
        return
    }
    const pass = decryptValue(password)
    const newAccount = await Account.create({
        email: username,
        status: "CREANDO",
        password: pass,
        expiration: demo ? moment().format('YYYY-MM-DD') : moment().add(months, 'months').format('YYYY-MM-DD'),
        profiles: 1,
        serviceId: 'de24f168-4f18-4a1d-a437-192fa9477df5',
        sharedBoardId: '2243e6ec-eb5b-456a-931a-9de58fda5af8',
        userId,
        createdInStore: true
    });
    try {
        const request = await fetch(`${URL_BOTS}/iptvPremiun`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...req.body, password: pass })
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
            }, { where: { id: newAccount.id } });
            res.status(200).json(response);
        } else {
            await Account.update({
                status: "ERROR",
            }, { where: { id: newAccount.id } });
            throw new Error(response.message)
        }
    } catch (err: any) {
        await Account.update({
            status: "ERROR",
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
try {
    await Account.update({
        status: "RENOVANDO",
    }, { where: { id: accountId } })
    const account = await Account.findByPk(accountId);
    if (!account) throw new Error('Cuenta no encontrada');
    const request = await fetch(`${URL_BOTS}/iptvPremiun/renew`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: account?.email, months, demo })
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
        res.status(200).json(response);
    } else {
        await Account.update({
            status: "ERROR",
        }, { where: { id: accountId } });
        throw new Error(response.message)
    }
} catch (err: any) {
    await Account.update({
        status: "ERROR",
    }, { where: { id: accountId } });
    res.status(400).json({ message: err.message });
}
};