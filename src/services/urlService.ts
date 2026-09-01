import { UrlRepository } from "../repository/urlRepository.js";
import { validateDomain } from "../utils/validateUserData.js";
import { generateShortId } from "../utils/nanoidTool.js";
import { AppError } from "../utils/AppError.js";

export class UrlService {
    constructor(private repository: UrlRepository) { }

    async shorten(orig_url: string): Promise<string> {
        const urlComproved = validateDomain(orig_url);
        if (!urlComproved.isValid) {
            throw new AppError(400, "URL no permitida", urlComproved.error, "URL_NOT_ALLOWED");
        }

        const urlID = generateShortId(8);
        return this.repository.create(urlID, orig_url);
    }

    async redirect(shortUrl: string): Promise<string> {
        if (!shortUrl || typeof shortUrl !== "string") {
            throw new AppError(401, "Debe ingresar una URL válida.", undefined, "INVALID_SHORT_URL");
        }

        const originalUrl = await this.repository.findById(shortUrl);
        if (!originalUrl) {
            throw new AppError(404, "URL acortada no encontrada.", undefined, "SHORT_URL_NOT_FOUND");
        }

        const revalidated = validateDomain(originalUrl);
        if (!revalidated.isValid) {
            throw new AppError(410, "URL de destino no permitida.", undefined, "DESTINATION_URL_NOT_ALLOWED");
        }

        return originalUrl;
    }
}