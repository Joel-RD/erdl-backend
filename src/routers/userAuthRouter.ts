import { Router, Request, NextFunction } from "express";
import { limitAuthButton } from "../utils/limitClick";
import { authJWT,  } from "../Middleware/authJWT.js"
import { userAuthController } from "../controllers/userAuthController.js";
import { AuthRepository } from "../repository/userAuthRepository";
import { verifyEmailMiddleware } from "../Middleware/verifySenCodeValidationHome";
import { turso } from "../Database/databases";

const router = Router();
const userAuthRepositorys = new AuthRepository(turso);
const userAuthControllers = new userAuthController(userAuthRepositorys);
let emailValidUser = userAuthControllers.returnUserEmail();

router.get("/auth/verify-email", verifyEmailMiddleware(emailValidUser), userAuthControllers.authVerifyEmailHomeController);
router.get("/auth", userAuthControllers.homeAuthController);
router.post("/auth/verify-email", limitAuthButton, verifyEmailMiddleware(emailValidUser), userAuthControllers.postAuthVerifyEmailController);
router.post("/auth/register", limitAuthButton, userAuthControllers.authRegisterController);
router.post("/auth/login", limitAuthButton, userAuthControllers.authLoginController);

//Root protected
router.get("/auth/protected/dashboard", authJWT, (req, res) => {
    res.send("Protected route");
});
export default router; 