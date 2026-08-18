import { Router } from "express";
import { limitAuthButton } from "../utils/limitClick.js";
import {verifySendToEmail} from "../Middleware/authJWT.js"
import { AuthController } from "../controllers/authController.js";
import { AuthRepository } from "../repository/authRepository.js";
import { AuthService } from "../services/authService.js";
import { turso } from "../Database/databases.js";

const router = Router();
const authRepository = new AuthRepository(turso);
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post("/auth/verify-email", limitAuthButton, verifySendToEmail, authController.postAuthVerifyEmailController);
router.post("/auth/register", limitAuthButton, authController.authRegisterController);
router.post("/auth/login", limitAuthButton, authController.authLoginController);

export default router;