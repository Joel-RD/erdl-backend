import { Router } from "express";
import { limitAuthButton } from "../utils/limitClick.js";
import { AuthController } from "../controllers/authController.js";
import { AuthRepository } from "../repository/authRepository.js";
import { turso } from "../Database/databases.js";

const router = Router();
const authRepository = new AuthRepository(turso);
const authController = new AuthController(authRepository);

router.post("/auth/verify-email", limitAuthButton, authController.postAuthVerifyEmailController);
router.post("/auth/register", limitAuthButton, authController.authRegisterController);
router.post("/auth/login", limitAuthButton, authController.authLoginController);

export default router;
 