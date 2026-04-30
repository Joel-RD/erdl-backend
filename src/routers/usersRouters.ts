import { Router } from "express";
import { UserController } from "../controllers/userControllers.js";
import { UserRepository } from "../repository/urlShortAnonimusRepository.js";
import { turso } from "../Database/databases.js";
import { redirectShort, url_Short } from "../utils/limitClick.js"

const router = Router();
const userRepository = new UserRepository(turso);
const userController = new UserController(userRepository);

router.get("/:shortUrl", url_Short ,userController.redirectShortController);
router.post("/api/v1/short", redirectShort ,userController.shortenerController);

export default router;
