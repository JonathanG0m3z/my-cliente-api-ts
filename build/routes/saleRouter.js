"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const saleController_1 = require("../controllers/saleController");
const router = express_1.default.Router();
router.get('/', jwtMiddleware_1.verifyToken, saleController_1.getSales);
router.post('/', jwtMiddleware_1.verifyToken, saleController_1.addSale);
router.get('/:id', jwtMiddleware_1.verifyToken, saleController_1.getSaleById);
router.post('/:id', jwtMiddleware_1.verifyToken, saleController_1.updateSale);
router.delete('/:id', jwtMiddleware_1.verifyToken, saleController_1.deleteSale);
router.post('/renew/:id', jwtMiddleware_1.verifyToken, saleController_1.renewSale);
exports.default = router;
