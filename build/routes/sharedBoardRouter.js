"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const sharedBoardController_1 = require("../controllers/sharedBoardController");
const router = express_1.default.Router();
router.get('/', jwtMiddleware_1.verifyToken, sharedBoardController_1.getSharedBoards);
router.post('/', jwtMiddleware_1.verifyToken, sharedBoardController_1.addSharedBoard);
router.post('/accounts', jwtMiddleware_1.verifyToken, sharedBoardController_1.addAccount);
router.post('/accounts/:id', jwtMiddleware_1.verifyToken, sharedBoardController_1.updateAccount);
router.delete('/accounts/:id', jwtMiddleware_1.verifyToken, sharedBoardController_1.deleteAccount);
router.put('/accounts/:id', jwtMiddleware_1.verifyToken, sharedBoardController_1.reactivateAccount);
router.get('/accounts/:sharedBoardId', jwtMiddleware_1.verifyToken, sharedBoardController_1.getAccounts);
router.get('/renewIptvAccounts/:sharedBoardId', jwtMiddleware_1.verifyToken, sharedBoardController_1.getAccountsToRenewIptv);
exports.default = router;
