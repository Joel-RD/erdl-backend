import { Router } from "express";
import { UrlController } from "../controllers/urlController.js";
import { UrlRepository } from "../repository/urlRepository.js";
import { turso } from "../Database/databases.js";
import { redirectShort, url_Short } from "../utils/limitClick.js"

const router = Router();
const urlRepository = new UrlRepository(turso);
const urlController = new UrlController(urlRepository);

router.get("/:shortUrl", url_Short ,urlController.redirectShortController);
router.post("/api/v1/short", redirectShort ,urlController.shortenerController);

export default router;
