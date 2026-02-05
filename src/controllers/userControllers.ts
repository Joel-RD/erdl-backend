import { Response } from "express";
import { RequestModel } from "../models/types.js"
import { SnowflakeGenerator } from "../utils/snowflake.js"
import { UserRepository } from "../repository/urlShortAnonimusRepository.js"
import { turso } from "../Database/databases.js"
import { config } from "../config.js"
import path from "path";

const userRepository = new UserRepository(turso);
const { baseUrl } = config;

export class UserController {
    constructor(private userRepository: UserRepository) { }

    homeController = async (req: RequestModel, res: Response) => {
        res.sendFile(path.join(process.cwd(), "public", "home.html"));
    }

    shortenerController = async (req: RequestModel, res: Response) => {
        try {
            const { orig_url } = req.body;

            if (!orig_url || typeof orig_url !== "string") {
                return res.status(400).json({ message: "Debe ingresar una URL válida." });
            }

            const snowflake = new SnowflakeGenerator(1);
            const urlID = snowflake.generateShortUrl();

            const short_url = await this.userRepository.create(urlID, orig_url);

            if (!short_url) {
                return res
                    .status(500)
                    .json({
                        message: "Error al crear la URL acortada.",
                    })
            }

            res.json({
                message: "URL acortada con éxito.",
                url_acortada: `${baseUrl}/${short_url}`,
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al acortar la URL." });
        }
    }

    redirectShortController = async (req: RequestModel, res: Response) => {
        try {
            const { shortUrl } = req.params;

            if (!shortUrl || typeof shortUrl !== "string") {
                return res.status(400).json({ message: "Debe ingresar una URL válida." });
            }

            const originalUrl = await this.userRepository.findById(shortUrl);

            if (!originalUrl) {
                return res.sendFile(path.join(process.cwd(), 'public', 'error.html'))
            }

            res.redirect(originalUrl);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error al redirigir la URL." });
        }
    }
}



