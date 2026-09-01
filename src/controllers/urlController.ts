import { Response, Request } from "express";
import { UrlService } from "../services/urlService.js"
import { config } from "../config.js"
import { sendOk } from "../utils/responseFormat.js";

const { baseUrl } = config;

export class UrlController {
    constructor(private urlService: UrlService) { }

    shortenerController = async (req: Request, res: Response) => {
        const { orig_url } = req.body;
        const urlID = await this.urlService.shorten(orig_url);

        return sendOk(res, { url_acortada: `${baseUrl}/${urlID}` }, "URL acortada con éxito.");
    }

    redirectShortController = async (req: Request, res: Response) => {
        const { shortUrl } = req.params;
        const originalUrl = await this.urlService.redirect(shortUrl);
        res.redirect(originalUrl);
    }
}