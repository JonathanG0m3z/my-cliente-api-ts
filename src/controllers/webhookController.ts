import { Request, Response } from "express";
import db from "../config/database";
import moment from "moment";
const { Account, User, BotExecution } = db;
const { IPTV_DISCOUNT, X_SECRET_TOKEN } = process.env;
const discount = Number(IPTV_DISCOUNT ?? 0);

const iptvPremiunPriceByMonths: { [key: number]: number } = {
    1: 1.75,
    // 1.5: 1.5,
    2: 2.75,
    3: 3.5,
    6: 6.5,
    12: 12
}

export const createAccountErrorProcess = async (executionId: string, accountId: string, response: any) => {
    await BotExecution.update({
        status: "ERROR",
        response
    }, { where: { id: executionId } });
    await Account.update({
        status: "ERROR",
        deleted_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }, { where: { id: accountId ?? '' } });
}

export const renewAccountErrorProcess = async (executionId: string, accountId: string, response: any) => {
    await BotExecution.update({
        status: "ERROR",
        response
    }, { where: { id: executionId } });
    await Account.update({
        status: "ERROR",
    }, { where: { id: accountId } });
}

export const createAccountWebhook = async (req: Request, res: Response) => {
    try {
        const incomingToken = req.headers['x-secret-token'];
        if (incomingToken !== X_SECRET_TOKEN) {
            res.status(401).send('Token inválido');
            return;
        }
        const { executionId, success, demo, exp, response } = req.body;
        if (!executionId || success === undefined || !response) {
            res.status(400).send('Falta informacion');
            return;
        }
        const execution: any = await BotExecution.findByPk(executionId, {
            include: [
                {
                    model: User,
                    attributes: ['balance']
                }
            ]
        });
        if (!execution) {
            res.status(404).send('Ejecucion no encontrada');
            return;
        }
        const price = iptvPremiunPriceByMonths[JSON.parse(execution.params?.body ?? '{}')?.months];
        if (success) {
            if (!demo) {
                const newBalance = Number(((execution.user?.balance ?? 0) - (price - (price * discount / 100))).toFixed(2));
                await User.update({
                    balance: newBalance
                }, { where: { id: execution.userId } });
            }
            await Account.update({
                status: "ACTIVA",
                expiration: moment(exp).format('YYYY-MM-DD')
            }, { where: { id: execution.accountId ?? '' } });
            await BotExecution.update({
                status: "CREADA",
                response
            }, { where: { id: execution.id } });
            res.status(200).send('OK');
            return;
        } else {
            await createAccountErrorProcess(execution.id, execution.accountId ?? '', response);
            res.status(200).json({ message: 'Ejecucion fallida' });
            return;
        }
    } catch (err: any) {
        res.status(500).send('Algo salió mal');
        return;
    }
};

export const renewAccountWebhook = async (req: Request, res: Response) => {
    try {
        const incomingToken = req.headers['x-secret-token'];
        if (incomingToken !== X_SECRET_TOKEN) {
            res.status(401).send('Token inválido');
            return;
        }
        const { executionId, success, demo, exp, response } = req.body;
        if (!executionId || success === undefined || !response) {
            res.status(400).send('Falta informacion');
            return;
        }
        const execution: any = await BotExecution.findByPk(executionId, {
            include: [
                {
                    model: User,
                    attributes: ['balance']
                }
            ]
        });
        if (!execution) {
            res.status(404).send('Ejecucion no encontrada');
            return;
        }
        const price = iptvPremiunPriceByMonths[JSON.parse(execution.params?.body ?? '{}')?.months];
        if (success) {
            if (!demo) {
                const newBalance = Number(((execution.user?.balance ?? 0) - (price - (price * discount / 100))).toFixed(2));
                await User.update({
                    balance: newBalance
                }, { where: { id: execution.userId } });
            }
            await Account.update({
                status: "ACTIVA",
                expiration: moment(exp).format('YYYY-MM-DD')
            }, { where: { id: execution.accountId ?? '' } });
            await BotExecution.update({
                status: "RENOVADA",
                response
            }, { where: { id: execution.id } });
            res.status(200).send('OK');
            return;
        } else {
            await renewAccountErrorProcess(execution.id, execution.accountId ?? '', response);
            res.status(200).json({ message: 'Ejecucion fallida' });
            return;
        }
    } catch (error) {
        res.status(500).send('Algo salió mal');
        return;
    }
}