import { Router } from "express";
import { UserController } from "../controllers/userControllers.js";
import { redirectShort, url_Short } from "../utils/limitClick.js";
import { UserRepository } from "../repository/urlShortAnonimusRepository.js";
import { turso } from "../Database/databases.js";

const router = Router();
const userRepository = new UserRepository(turso);
const userController = new UserController(userRepository);


router.get("/home", userController.homeController);
router.get("/:shortUrl", redirectShort, userController.redirectShortController);
router.post("/api/v1/short", url_Short, userController.shortenerController);

export default router;