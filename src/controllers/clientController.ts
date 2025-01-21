import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import { Op } from 'sequelize';
import db from "../config/database";

const { Client } = db;

export const getClientsCombobox = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { search = '', page = 1, limit = 5 } = req.query;
        const whereCondition: any = {
            userId,
        };
        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ];
        }
        const offset = (Number(page) - 1) * Number(limit);
        const options = {
            where: whereCondition,
            offset: Number(offset),
            limit: Number(limit)
        };
        const clients = await Client.findAndCountAll(options);
        res.status(200).json({
            total: clients.count,
            totalPages: Math.ceil(clients.count / Number(limit)),
            currentPage: page,
            clients: clients.rows.map(client => ({
                id: client.id,
                phone: client.phone,
                name: client.name
            }))
        });
    } catch (err: any) {
        res.status(400).json({message: err.message});
    }
};

export const updateClient = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const { name, phone, email, country } = req.body;
        await Client.update({
            email,
            name,
            phone,
            country
        }, { where: { userId, id } });
        res.status(200).json({ message: "Cliente actualizado correctamente" });
    } catch (err: any) {
        res.status(400).json({message: err.message});
    }
};