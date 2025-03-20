import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import { Op } from 'sequelize';
import db from "../config/database";
import { decryptValue, encryptValue } from "../utils/cryptoHooks";
import moment from "moment";

const { SharedBoard, Account, Service } = db;

export const getSharedBoards = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId, email } = req;
        const { page = 1, limit = 10 } = req.query; // Establecer valores predeterminados para la página y el límite
        const offset = (Number(page) - 1) * Number(limit); // Calcular el desplazamiento basado en la página y el límite
        const boards = await SharedBoard.findAndCountAll({
            where: {
                [Op.or]: [
                    { userId: userId },
                    {
                        users: {
                            [Op.contains]: {
                                [`${email}`]: ['VER']
                            }
                        }
                    }
                ],
                deleted_at: { [Op.is]: null }
            },
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            total: boards.count,
            boards: boards.rows
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addSharedBoard = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) throw Error("El usuario no existe");
        const { users, name } = req.body;
        await SharedBoard.create({
            users: users,
            name: name,
            userId,
        });
        res.status(200).json({ message: "Tablero compartido creado correctamente" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { email, password, expiration, service, sharedBoardId, extras } = req.body;
        const sharedBoard = await SharedBoard.findOne({ where: { id: sharedBoardId } });
        if (!sharedBoard) throw new Error('No existe el tablero compartido');
        const newAccount = await Account.create({
            email: email,
            password: decryptValue(password),
            expiration: expiration,
            profiles: 0,
            serviceId: service?.value,
            userId: sharedBoard.userId,
            sharedBoardId,
            extras
        });
        res.status(200).json({ ...newAccount.dataValues, password: password, service: { name: service?.label } });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { email, password, expiration, profiles, service, extras } = req.body;
        await Account.update({
            email: email,
            password: decryptValue(password),
            expiration: expiration,
            profiles: profiles,
            serviceId: service?.value,
            extras,
        }, { where: { id } });
        res.status(200).json({ message: "Cuenta actualizada correctamente" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Account.update({ deleted_at: moment().format('YYYY-MM-DD HH:mm:ss') }, { where: { id } });
        res.status(200).json({ message: "Cuenta eliminada correctamente" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const reactivateAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        await Account.update({ deleted_at: null }, { where: { id } });
        res.status(200).json({ message: "Cuenta reactivada correctamente" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getAccounts = async (req: PersonalRequest, res: Response) => {
    try {
        const { email, userId } = req;
        const { sharedBoardId } = req.params;
        if(!email || !userId || !sharedBoardId) throw new Error('Falta información');
        const doIHaveAccess: any = await SharedBoard.findOne({
            where: {
                id: sharedBoardId,
                [Op.or]: [
                    { userId: userId },
                    {
                        users: {
                            [Op.contains]: {
                                [`${email}`]: ['VER']
                            }
                        }
                    }
                ],
            }
        });
        if (!doIHaveAccess) throw new Error('No tienes acceso a este tablero compartido');
        const { page = 1, limit = 10, search = '', is_deleted, end_date, begin_date, service } = req.query;
        const order = req.query.order as any;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause: any = {
            sharedBoardId,
            [Op.or]: [
                { email: { [Op.iLike]: `%${search}%` } },
                { password: { [Op.iLike]: `%${search}%` } }
            ]
        };

        if (is_deleted === 'true') {
            whereClause.deleted_at = { [Op.not]: null };
        } else if (is_deleted === 'false') {
            whereClause.deleted_at = null;
        }

        if (end_date && begin_date) {
            whereClause.expiration = {
                [Op.between]: [begin_date, end_date]
            };
        } else if (end_date) {
            whereClause.expiration = {
                [Op.lte]: end_date
            };
        } else if (begin_date) {
            whereClause.expiration = {
                [Op.gte]: begin_date
            };
        }

        if (service && typeof service === 'string') {
            const services = service.split(',');
            whereClause.serviceId = {
                [Op.in]: services
            };
        }

        const accounts = await Account.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Service,
                    attributes: ['name']
                }
            ],
            order: [...(order === '' || order === undefined) ? [] : [order.split(' ')]],
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            total: accounts.count,
            accounts: accounts.rows.map(account => ({ ...account.dataValues, password: encryptValue(account.dataValues.password) })),
            permissions: userId === doIHaveAccess.userId ? 'admin' : doIHaveAccess.users?.[email]
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getAccountsToRenewIptv = async (req: PersonalRequest, res: Response) => {
    try {
        const { email, userId } = req;
        const { sharedBoardId } = req.params;
        if(!email || !userId || !sharedBoardId) throw new Error('Falta información');
        const doIHaveAccess: any = await SharedBoard.findOne({
            where: {
                id: sharedBoardId,
                [Op.or]: [
                    { userId: userId },
                    {
                        users: {
                            [Op.contains]: {
                                [`${email}`]: ['VER']
                            }
                        }
                    }
                ],
            }
        });
        if (!doIHaveAccess) throw new Error('No tienes acceso a este tablero compartido');
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause: any = {
            sharedBoardId,
            [Op.or]: [
                { email: { [Op.iLike]: `%${search}%` } },
                { password: { [Op.iLike]: `%${search}%` } }
            ]
        };
        whereClause.deleted_at = null;

        const accounts = await Account.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Service,
                    attributes: ['name'],
                    where: {
                        id: 'de24f168-4f18-4a1d-a437-192fa9477df5'
                    }
                }
            ],
            order: [['expiration', 'ASC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        res.status(200).json({
            total: accounts.count,
            accounts: accounts.rows.map(account => ({ ...account.dataValues, password: encryptValue(account.dataValues.password) })),
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};