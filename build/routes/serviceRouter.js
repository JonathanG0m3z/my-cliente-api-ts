"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const serviceController_1 = require("../controllers/serviceController");
const router = express_1.default.Router();
router.get('/', jwtMiddleware_1.verifyToken, serviceController_1.getServices);
router.get('/combobox', jwtMiddleware_1.verifyToken, serviceController_1.getServicesCombo);
router.post('/', jwtMiddleware_1.verifyToken, serviceController_1.addService);
router.post('/:id', jwtMiddleware_1.verifyToken, serviceController_1.updateService);
router.delete('/:id', jwtMiddleware_1.verifyToken, serviceController_1.deleteService);
exports.default = router;
