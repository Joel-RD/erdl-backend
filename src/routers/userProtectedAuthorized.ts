import { Router, Response } from "express";
import { limitAuthButton } from "../utils/limitClick.js";
import { authJWT, verifySendToEmail } from "../Middleware/authJWT.js"
import { userAuthController } from "../controllers/userAuthController.js";
import { RequestModel } from "../models/types.js";
import { AuthRepository } from "../repository/userAuthRepository.js";
import { turso } from "../Database/databases.js";

const router = Router();
const userAuthRepositorys = new AuthRepository(turso);
const userAuthControllers = new userAuthController(userAuthRepositorys);

router.get(`/profile`, authJWT, (req: RequestModel, res: Response) => {
    res.send('profile')
});

export default router;  