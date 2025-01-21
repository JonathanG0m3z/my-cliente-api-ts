import { Response } from "express";
import { PersonalRequest } from "../interface/Request";
import { Op } from 'sequelize';
import db from "../config/database";
import { decryptValue } from "../utils/cryptoHooks";

const { SharedBoard } = db;

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

// export const addAccount = async (req: PersonalRequest, res: Response) => {
//     try {
//         const { email, password, expiration, service, sharedBoardId, extras } = req.body;
//         const sharedBoard = await SharedBoard.findOne({ where: { id: sharedBoardId } });
//         if (!sharedBoard) throw new Error('No existe el tablero compartido');
//         const newAccount = await Account.create({
//             email: email,
//             password: decryptValue(password),
//             expiration: expiration,
//             profiles: 0,
//             serviceId: service?.value,
//             userId: sharedBoard.userId,
//             sharedBoardId,
//             extras
//         });
//         res.status(200).json({ ...newAccount.dataValues, password: password, service: { name: service?.label } });
//     } catch (err: any) {
//         res.status(400).json({ message: err.message });
//     }
// };