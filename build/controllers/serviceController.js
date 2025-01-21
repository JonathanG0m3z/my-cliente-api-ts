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
exports.deleteService = exports.updateService = exports.addService = exports.getServicesCombo = exports.getServices = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const { Service } = database_1.default;
const getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const services = yield Service.findAndCountAll({
            where: {
                [sequelize_1.Op.or]: [
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
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getServices = getServices;
const getServicesCombo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { search = '', page = 1, limit = 5 } = req.query;
        const whereCondition = {
            [sequelize_1.Op.or]: [
                { userId: null },
                { userId: userId }
            ]
        };
        if (search) {
            whereCondition.name = {
                [sequelize_1.Op.iLike]: `%${search}%`
            };
        }
        const offset = (Number(page) - 1) * Number(limit);
        const options = {
            where: whereCondition,
            offset: Number(offset),
            limit: Number(limit)
        };
        const services = yield Service.findAndCountAll(options);
        res.status(200).json({
            total: services.count,
            totalPages: Math.ceil(services.count / Number(limit)),
            currentPage: page,
            services: services.rows.map(service => ({
                id: service.id,
                name: service.name
            }))
        });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.getServicesCombo = getServicesCombo;
const addService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { name } = req.body;
        if (!name || !userId)
            throw Error("Complete la información por favor");
        if (name === 'Activación youtube')
            throw Error("Este nombre se encuentra protegido, usa otro");
        const newService = yield Service.create({ name, userId });
        res.status(200).json(newService);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.addService = addService;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { id } = req.params;
        const { name } = req.body;
        if (!name || !id)
            throw Error("Complete la información por favor");
        if (name === 'Activación youtube')
            throw Error("Este nombre se encuentra protegido, usa otro");
        const isValid = yield Service.findByPk(id);
        if (!isValid)
            throw Error("El servicio no existe");
        yield Service.update({ name }, { where: { id, userId } });
        res.status(200).json({ message: 'Servicio actualizado con exito' });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.updateService = updateService;
const deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req;
        const { id } = req.params;
        const isValid = yield Service.findByPk(id);
        if (!isValid)
            throw Error("El servicio no existe");
        yield Service.destroy({ where: { id, userId } });
        res.status(200).json({ message: "Servicio eliminado correctamente" });
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
exports.deleteService = deleteService;
