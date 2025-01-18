import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import db from "../config/database";
import { decryptValue, encryptValue } from "../utils/cryptoHooks";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { User } = db;
const { JWT_SECRET = '' } = process.env;


export const createUser = async (req: PersonalRequest, res: Response) => {
    try {
        const { name, password, phone, email, country } = req.body;
        if (!name || !password || !phone || !email || !country) throw Error("Error: information incomplete");
        const decryptedPassword = decryptValue(password);
        const hashedPassword = await bcrypt.hash(decryptedPassword, 12);
        await User.create({ name, phone, email, password: hashedPassword, google_account: false, country });
        res.status(200).json({
            message: "Usuario creado correctamente",
        });
    } catch (error: any) {
        if (error.parent?.code === 'ER_DUP_ENTRY') res.status(400).json({ message: 'Este correo ya se encuentra registrado. Intenta con otro diferente.' });
        else res.status(400).json({ message: error.message });
    }
}

export const validateUser = async (req: PersonalRequest, res: Response) => {
    try {
        const { email, password, remember = false } = req.body;
        if (!email || !password) throw Error("Error: information incomplete");
        const userDB = await User.findOne({ where: { email: email } });
        if (userDB === null) throw Error("Este correo electrónico no se encuentra registrado");
        if(userDB.google_account) throw Error("Este correo electrónico fue registrado por medio de google");
        const decryptedPassword = decryptValue(password);
        const isPasswordMatch = await bcrypt.compare(decryptedPassword, userDB.password);
        if (isPasswordMatch) {
            const payload = { ...userDB.dataValues, password: null };
            const decryptedToken = jwt.sign(payload, JWT_SECRET, { expiresIn: remember ? '7d' : '1d' });
            const token = encryptValue(decryptedToken);
            res.status(200).json({ token });
        } else throw Error("Email o contraseña incorrectos");
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const logOut = async (req: PersonalRequest, res: Response) => {
    try {
        const encryptedToken = req.headers.authorization;
        if (!encryptedToken) throw Error("No se proporcionó un token de autenticación");
        res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const googleAuth = async (req: PersonalRequest, res: Response) => {
    try {
        const { name, email, picture, password } = req.body;
        if (!name || !password || !picture || !email) throw Error("Error: information incomplete");
        const decryptedPassword = decryptValue(password);
        const hashedPassword = await bcrypt.hash(decryptedPassword, 12);
        const userDB = await User.findOne({ where: { email: email } });
        if (userDB === null) {
            const newUser = await User.create({ name, phone: undefined, email, password: hashedPassword, google_account: true, picture });
            const payload = { ...newUser.dataValues, password: null };
            const decryptedToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
            const token = encryptValue(decryptedToken);
            res.status(200).json({ token });
        } else {
            if (userDB.google_account === false) throw Error('Esta cuenta fue creada manualmente en la plataforma y no usando Google');
            const isPasswordMatch = await bcrypt.compare(decryptedPassword, userDB.password);
            if (isPasswordMatch) {
                const payload = { ...userDB.dataValues, password: null };
                const decryptedToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
                const token = encryptValue(decryptedToken);
                res.status(200).json({ token });
            } else {
                res.status(400).json({ message: "Hubo un error de comparación con la cuenta existente" });
            }
        }
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getBalanceById = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        if (!userId) throw Error("ID de usuario no proporcionado");
        const userDB = await User.findByPk(userId);
        if (!userDB) throw Error("Información de usuario no encontrada");
        res.status(200).json({ balance: userDB.balance ?? 0 });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export const getAdminBalance = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { id } = req.params;
        if (!userId || !id) throw Error("Informacion incompleta");
        if(userId !== 'd7887bff-24d2-4e26-b3aa-c2bd18323003') throw Error("No tienes permisos para realizar esta operación");
        const userDB = await User.findByPk(id);
        if (!userDB) throw Error("Información de usuario no encontrada");
        res.status(200).json({ balance: userDB.balance ?? 0 });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateBalance = async (req: PersonalRequest, res: Response) => {
    try {
        const { userId } = req;
        const { amount, id } = req.body;
        if(userId !== 'd7887bff-24d2-4e26-b3aa-c2bd18323003') throw Error("No tienes permisos para realizar esta operación");
        const userDB = await User.findByPk(id);
        if (!userDB) throw Error("Información de usuario no encontrada");
        const newBalance = (userDB.balance ?? 0) + (amount ?? 0)
        await User.update({
            balance: newBalance
        }, { where: { id } });
        res.status(200).json({ message: "Saldo actualizado con exito" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};