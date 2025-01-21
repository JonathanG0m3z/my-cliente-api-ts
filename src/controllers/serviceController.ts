import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import { Op } from 'sequelize';
import db from "../config/database";

const { Service } = db;

export const getServices = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const services = await Service.findAndCountAll({
            where: {
                [Op.or]: [
                    { userId: null },
                    { userId: userId }
                ]
            },
            order: [['name', 'ASC']],
            limit: Number(limit),
            offset: Number(offset)
        });
        res.status(200).json({
            total: services.count,
            services: services.rows
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getServicesCombo = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { search = '', page = 1, limit = 5 } = req.query;
        const whereCondition: any = {
            [Op.or]: [
                { userId: null },
                { userId: userId }
            ]
        };
        if (search) {
            whereCondition.name = {
                [Op.iLike]: `%${search}%`
            };
        }
        const offset = (Number(page) - 1) * Number(limit);
        const options = {
            where: whereCondition,
            offset: Number(offset),
            limit: Number(limit)
        };
        const services = await Service.findAndCountAll(options);
        res.status(200).json({
            total: services.count,
            totalPages: Math.ceil(services.count / Number(limit)),
            currentPage: page,
            services: services.rows.map(service => ({
                id: service.id,
                name: service.name
            }))
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addService = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { name } = req.body;
        if (!name || !userId) throw Error("Complete la información por favor");
        if (name === 'Activación youtube') throw Error("Este nombre se encuentra protegido, usa otro");
        const newService = await Service.create({ name, userId });
        res.status(200).json(newService);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateService = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !id) throw Error("Complete la información por favor");
        if (name === 'Activación youtube') throw Error("Este nombre se encuentra protegido, usa otro");
        const isValid = await Service.findByPk(id);
        if (!isValid) throw Error("El servicio no existe");
        await Service.update({ name }, { where: { id, userId } });
        res.status(200).json({ message: 'Servicio actualizado con exito' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteService = async (req: PersonalRequest, res: Response) => {
    try {
        const {userId} = req;
        const {id} = req.params;
        const isValid = await Service.findByPk(id);
        if(!isValid) throw Error("El servicio no existe");
        await Service.destroy({ where: { id, userId } });
        res.status(200).json({message: "Servicio eliminado correctamente"});
    } catch (err: any) {
        res.status(400).json({message: err.message});
    }
};