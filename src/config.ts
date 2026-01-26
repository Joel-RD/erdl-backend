
import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    baseUrl: process.env.DOMAIN_FOR_FRONTEND|| "http://localhost:3000",
};
``