import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import db from "../config/database";

const { User } = db;


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