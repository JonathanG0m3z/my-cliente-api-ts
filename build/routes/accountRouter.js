"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const accountController_1 = require("../controllers/accountController");
const router = express_1.default.Router();
router.get('/', jwtMiddleware_1.verifyToken, accountController_1.getAccounts);
router.post('/', jwtMiddleware_1.verifyToken, accountController_1.addAccount);
router.get('/combobox', jwtMiddleware_1.verifyToken, accountController_1.getAccountsCombo);
router.get('/:id', jwtMiddleware_1.verifyToken, accountController_1.getAccountById);
router.post('/:id', jwtMiddleware_1.verifyToken, accountController_1.updateAccount);
router.delete('/:id', jwtMiddleware_1.verifyToken, accountController_1.deleteAccount);
router.post('/renew/:id', jwtMiddleware_1.verifyToken, accountController_1.renewAccount);
exports.default = router;
