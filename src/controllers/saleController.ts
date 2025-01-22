import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import { Op } from 'sequelize';
import db from "../config/database";
import { decryptValue, encryptValue } from "../utils/cryptoHooks";
import moment from "moment";

const { Sale, Account, Service, Client } = db;

export const getSales = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const currentDate = moment().subtract(3, 'days').format('YYYY-MM-DD'); // Obtener la fecha actual
        const { page = 1, limit = 10, search = '' } = req.query; // Establecer valores predeterminados para la página y el límite
        const offset = (Number(page) - 1) * Number(limit); // Calcular el desplazamiento basado en la página y el límite

        const sales: any = await Sale.findAndCountAll({
            where: {
                userId,
                expiration: { [Op.gte]: currentDate },
                renewed: { [Op.not]: true },
                [Op.or]: [
                    { '$client.name$': { [Op.iLike]: `%${search}%` } },
                    { '$client.email$': { [Op.iLike]: `%${search}%` } },
                    { '$client.phone$': { [Op.iLike]: `%${search}%` } },
                    { '$account.email$': { [Op.iLike]: `%${search}%` } },
                    { '$account.password$': { [Op.iLike]: `%${search}%` } },
                    { '$account.service.name$': { [Op.iLike]: `%${search}%` } }
                ]
            },
            include: [
                {
                    model: Client,
                    attributes: ['name', 'phone', 'email', 'id', 'country'],
                },
                {
                    model: Account,
                    attributes: ['email', 'password', 'id', 'expiration'],
                    include: [
                        {
                            model: Service,
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['expiration', 'ASC']],
            limit: Number(limit),
            offset: Number(offset)
        });

        // Encriptar el campo de contraseña en cada cuenta de usuario
        sales.rows.forEach((sale: any) => {
            sale.account.password = encryptValue(sale.account.password);
        });

        res.status(200).json({
            total: sales.count,
            sales: sales.rows
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addSale = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) throw new Error('Falta información');
        const { expiration, account, client, pin, profile, price } = req.body;
        if (!expiration || !account || !client) throw Error("Completa la información");
        const newClient = client.search?.label
            ? await Client.findByPk(client.search?.value)
            : await Client.create({
                name: client.name,
                phone: client.phone,
                email: client.email,
                country: client.country,
                userId,
            });
        if (!newClient) throw new Error('No se pudo encontrar el cliente');
        let newAccount: any = {};
        if (account?.email?.label) {
            newAccount = await Account.findByPk(account?.email?.value, {
                include: [{
                    model: Service,
                    attributes: ['name']
                }]
            });
        } else {
            const temporalAccount = await Account.create({
                email: account?.email?.value,
                password: decryptValue(account?.password),
                expiration: account?.expiration,
                profiles: account?.profiles,
                serviceId: account?.service?.value,
                userId,
            });
            newAccount = await Account.findByPk(temporalAccount.id, {
                include: [{
                    model: Service,
                    attributes: ['name']
                }]
            });
        }
        const newSale = await Sale.create({
            userId,
            price: price ?? 0,
            profile,
            pin,
            expiration,
            accountId: newAccount.id,
            clientId: newClient.id,
        });
        res.status(200).json({
            message: 'Venta registrada con éxito',
            sale: newSale, // Include the newSale details
            account: {
                ...newAccount.dataValues,
                password: encryptValue(newAccount.password)
            }, // Include the newAccount details
            client: newClient, // Include the newClient details
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getSaleById = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const sale = await Sale.findOne({
            where: { userId, id },
            include: [{
                model: Client,
                attributes: ['name', 'phone', 'email'],
            }, {
                model: Account,
                attributes: ['email', 'password'],
            }]
        });
        if (!sale) throw Error("No se encontró la venta");
        res.status(200).json(sale);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateSale = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { expiration, account, client, pin, profile, price } = req.body;
        if (!expiration || !account || !client) throw Error("Completa la información");

        const saleToUpdate = await Sale.findByPk(id);

        if (!saleToUpdate) throw Error("No se encontró la venta");

        saleToUpdate.expiration = expiration;
        saleToUpdate.pin = pin;
        saleToUpdate.profile = profile;
        saleToUpdate.price = price ?? saleToUpdate.price;

        let updatedAccount: any = {};
        if (account?.email?.label) {
            updatedAccount = await Account.findByPk(account?.email?.value, {
                include: [{
                    model: Service,
                    attributes: ['name']
                }]
            });
        } else {
            const temporalAccount = await Account.create({
                email: account?.email?.value,
                password: decryptValue(account?.password),
                expiration: account?.expiration,
                profiles: account?.profiles,
                serviceId: account?.service?.value,
                userId: saleToUpdate.userId,
            });
            updatedAccount = await Account.findByPk(temporalAccount.id, {
                include: [{
                    model: Service,
                    attributes: ['name']
                }]
            });
        }

        const updatedClient = client.search?.label
            ? await Client.findByPk(client.search?.value)
            : await Client.create({
                name: client.name,
                phone: client.phone,
                email: client.email,
                country: client.country,
                userId: saleToUpdate.userId,
            });

        if (!updatedClient) throw Error("No se encontró el cliente");

        saleToUpdate.accountId = updatedAccount.id;
        saleToUpdate.clientId = updatedClient.id;

        await saleToUpdate.save();

        res.status(200).json({
            message: 'Venta actualizada con éxito',
            sale: saleToUpdate,
            account: {
                ...updatedAccount.dataValues,
                password: encryptValue(updatedAccount.password)
            },
            client: updatedClient,
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteSale = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        const isValid = await Sale.findAll({ where: { userId, id } });
        if (!isValid) throw Error("No se encontró el ID de la venta");
        await Sale.destroy({ where: { userId, id } });
        res.status(200).json({ message: "Venta eliminada con exito" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const renewSale = async (req: PersonalRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { expiration, pin, profile, price } = req.body;

        // Buscar la venta existente
        const sale = await Sale.findByPk(id);
        if (!sale) throw new Error("La venta no fue encontrada");

        // Actualizar el campo renew en la venta existente
        await Sale.update({ renewed: true }, { where: { id: id } });

        // Crear una nueva venta basada en los datos de la venta existente
        const newSale = await Sale.create({
            userId: sale.userId,
            price: price ?? sale.price,
            profile: profile ?? sale.profile,
            pin: pin ?? sale.pin,
            expiration: expiration ?? sale.expiration,
            accountId: sale.accountId,
            clientId: sale.clientId,
        });

        res.status(200).json({
            message: 'Venta renovada exitosamente',
            renewedSale: newSale,
        });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};