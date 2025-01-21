"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const clientController_1 = require("../controllers/clientController");
const router = express_1.default.Router();
router.get('/combobox', jwtMiddleware_1.verifyToken, clientController_1.getClientsCombobox);
router.post('/:id', jwtMiddleware_1.verifyToken, clientController_1.updateClient);
exports.default = router;
