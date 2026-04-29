import { nanoid } from "nanoid";

export function generateShortUrl() {
    return nanoid(10)
}
