import { Router } from "express";
import { limitAuthButton } from "../utils/limitClick.js";
import { verifySendToEmail } from "../Middleware/authJWT.js"
import { userAuthController } from "../controllers/userAuthController.js";
import { AuthRepository } from "../repository/userAuthRepository.js";
import { turso } from "../Database/databases.js";

const router = Router();
const userAuthRepositorys = new AuthRepository(turso);
const userAuthControllers = new userAuthController(userAuthRepositorys);

// router.post("/auth/verify-email", limitAuthButton, verifySendToEmail, userAuthControllers.postAuthVerifyEmailController);
// router.post("/auth/register", limitAuthButton, userAuthControllers.authRegisterController);
// router.post("/auth/login", limitAuthButton, userAuthControllers.authLoginController);

export default router;
