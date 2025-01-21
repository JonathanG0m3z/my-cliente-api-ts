"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClient = exports.getClientsCombobox = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const { Client } = database_1.default;
const getClientsCombobox = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { search = '', page = 1, limit = 5 } = req.query;
        const whereCondition = {
            userId,
        };
        if (search) {
            whereCondition[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { phone: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { email: { [sequelize_1.Op.iLike]: `%${search}%` } },
            ];
        }
        const offset = (Number(page) - 1) * Number(limit);
        const options = {
            where: whereCondition,
            offset: Number(offset),
            limit: Number(limit)
        };
        const clients = yield Client.findAndCountAll(options);
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
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getClientsCombobox = getClientsCombobox;
const updateClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId } = req;
        const { name, phone, email, country } = req.body;
        yield Client.update({
            email,
            name,
            phone,
            country
        }, { where: { userId, id } });
        res.status(200).json({ message: "Cliente actualizado correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateClient = updateClient;
