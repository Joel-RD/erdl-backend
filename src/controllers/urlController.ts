import { Response, Request } from "express";
import { generateShortId } from "../utils/nanoidTool.js"
import { UrlRepository } from "../repository/urlRepository.js"
import { config } from "../config.js"
import logger from "../utils/logger.js";

const { baseUrl } = config;

export class UrlController {
    constructor(private urlRepository: UrlRepository) { }

    shortenerController = async (req: Request, res: Response) => {
        try {
            const { orig_url } = req.body;

            if (!orig_url || typeof orig_url !== "string") 
                return res.status(401).json({ message: "Debe ingresar una URL válida." });

            const urlID = generateShortId(8);
            const short_url = await this.urlRepository.create(urlID, orig_url);
            if (!short_url) return res.status(500).json({message: "Error al crear la URL acortada."})

            res.json({
                message: "URL acortada con éxito.",
                url_acortada: `${baseUrl}/${urlID}`,
            });
        } catch (error) {
            logger.error('Error en shortenerController', { error });
            res.status(500).json({ message: "Error al acortar la URL" });
        }
    }

    redirectShortController = async (req: Request, res: Response) => {
        try {
            const { shortUrl } = req.params;

            if (!shortUrl || typeof shortUrl !== "string")
                return res.status(401).json({ message: "Debe ingresar una URL válida." });
            

            const originalUrl = await this.urlRepository.findById(shortUrl);
            if (!originalUrl) return res.status(404).json({ error: "Not Found", message: "URL acortada no encontrada."})
            res.redirect(originalUrl);
        } catch (error) {
            logger.error('Error en redirectShortController', { error });
            res.status(500).json({ message: "Error al redirigir la URL." });
        }
    }
}
