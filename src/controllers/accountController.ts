import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import { Op } from 'sequelize';
import db from "../config/database";
import { decryptValue, encryptValue } from "../utils/cryptoHooks";
import moment from "moment";

const { Sale, Account, Service, SharedBoard } = db;

export const getAccounts = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId, email } = req;
        const { page = 1, limit = 10, search = '', is_deleted, end_date, begin_date, service } = req.query as any;
        const order = req.query.order as any;
        const offset = (Number(page) - 1) * Number(limit);

        const boards = await SharedBoard.findAll({
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
            }
        });
        const myBoardsIds = boards.map((board) => board.dataValues.id);

        let whereClause: any = {
            [Op.or]: [
                { userId: userId },
                {
                    sharedBoardId: {
                        [Op.in]: myBoardsIds
                    }
                }
            ],
            [Op.and]: [
                {
                    [Op.or]: [
                        { email: { [Op.iLike]: `%${search}%` } },
                        { password: { [Op.iLike]: `%${search}%` } }
                    ]
                }
            ]
        };

        if (is_deleted === 'true') {
            whereClause[Op.and].push({ deleted_at: { [Op.not]: null } });
        } else if (is_deleted === 'false') {
            whereClause[Op.and].push({ deleted_at: null });
        }

        if (end_date && begin_date) {
            whereClause[Op.and].push({
                expiration: {
                    [Op.between]: [begin_date, end_date]
                }
            });
        } else if (end_date) {
            whereClause[Op.and].push({
                expiration: {
                    [Op.lte]: end_date
                }
            });
        } else if (begin_date) {
            whereClause[Op.and].push({
                expiration: {
                    [Op.gte]: begin_date
                }
            });
        }

        if (service && typeof service === 'string') {
            const services = service.split(',');
            whereClause[Op.and].push({
                serviceId: {
                    [Op.in]: services
                }
            });
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
        const accountsList = []
        // Iterar sobre cada cuenta para agregar el campo profilesAvailable
        for (const account of accounts.rows) {
            const salesCount = await Sale.count({
                where: {
                    accountId: account.dataValues.id,
                    renewed: { [Op.not]: true },
                    expiration: { [Op.gte]: moment().format('YYYY-MM-DD') }
                }
            });
            accountsList.push({
                ...account.dataValues,
                profilesAvailable: account.dataValues.profiles - salesCount,
                password: encryptValue(account.password)
            });
        }
        res.status(200).json({
            total: accounts.count,
            accounts: accountsList
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) throw new Error('Falta información');
        const { email, password, expiration, profiles, service } = req.body;
        const newAccount = await Account.create({
            email: email,
            password: decryptValue(password),
            expiration: expiration,
            profiles: profiles,
            serviceId: service?.value,
            userId,
        });
        res.status(200).json({ ...newAccount, password: password, service: { name: service?.label } });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getAccountsCombo = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId, email } = req;
        const { search = '', page = 1, limit = 5 } = req.query;
        const boards = await SharedBoard.findAll({
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
            }
        });
        const myBoardsIds = boards.map((board) => board.dataValues.id);
        const whereCondition: any = {
            [Op.or]: [
                { userId: userId },
                {
                    sharedBoardId: {
                        [Op.in]: myBoardsIds
                    }
                }
            ],
            expiration: {
                [Op.gte]: moment().subtract(3, 'days')
            },
            deleted_at: { [Op.is]: null },
            // sharedBoardId: { [Op.is]: null }
        };
        if (search) {
            whereCondition.email = {
                [Op.iLike]: `%${search}%`
            };
        }
        const offset = (Number(page) - 1) * Number(limit);
        const options = {
            where: whereCondition,
            offset: Number(offset),
            limit: Number(limit),
            include: [
                {
                    model: Service,
                    attributes: ['name']
                }
            ],
        };
        const accounts: any = await Account.findAndCountAll(options);
        res.status(200).json({
            total: accounts.count,
            totalPages: Math.ceil(accounts.count / Number(limit)),
            currentPage: page,
            accounts: accounts.rows.map((account: any) => ({
                id: account.id,
                email: account.email,
                service_name: account.service?.name
            }))
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getAccountById = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        if(!userId) throw new Error('Falta información');
        const { id } = req.params;
        const account = await Account.findByPk(id, {
            include: [
                { model: Service, attributes: ['name'] }
            ]
        });
        if (!account) throw Error("AccountId doesn't exist");
        res.status(200).json({
            ...account.dataValues,
            password: encryptValue(account.dataValues.password)
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const { email, password, expiration, profiles, service } = req.body;
        await Account.update({
            email: email,
            password: decryptValue(password),
            expiration: expiration,
            profiles: profiles,
            serviceId: service?.value,
            userId,
        }, { where: { userId, id } });
        res.status(200).json({ message: "Cuenta actualizada correctamente" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        await Account.update({ deleted_at: moment().format('YYYY-MM-DD HH:mm:ss') }, { where: { userId, id } });
        res.status(200).json({ message: "Cuenta eliminada correctamente" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const renewAccount = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { password, expiration } = req.body;
        const account = await Account.findByPk(id);
        if (!account) throw new Error("La cuenta no fue encontrada");
        await Account.update({
            password: decryptValue(password),
            expiration: expiration
        }, { where: { id: id } });
        res.status(200).json({
            message: 'Cuenta renovada exitosamente'
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};