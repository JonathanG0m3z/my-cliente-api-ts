"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const botController_1 = require("../controllers/botController");
const router = express_1.default.Router();
router.post('/iptvPremiun', jwtMiddleware_1.verifyToken, botController_1.createIptvPremiunAccount);
router.post('/iptvPremiun/renew', jwtMiddleware_1.verifyToken, botController_1.renewIptvPremiunAccount);
exports.default = router;
