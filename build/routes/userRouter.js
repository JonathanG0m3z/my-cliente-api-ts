"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtMiddleware_1 = require("../middlewares/jwtMiddleware");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.post('/', userController_1.createUser);
router.post('/validate', userController_1.validateUser);
router.get('/logOut', jwtMiddleware_1.verifyToken, userController_1.logOut);
router.post('/signin', userController_1.googleAuth);
router.get('/getBalance', jwtMiddleware_1.verifyToken, userController_1.getBalanceById);
router.get('/getAdminBalance/:id', jwtMiddleware_1.verifyToken, userController_1.getAdminBalance);
router.post('/updateBalance', jwtMiddleware_1.verifyToken, userController_1.updateBalance);
exports.default = router;
