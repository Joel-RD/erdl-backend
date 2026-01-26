import app from "./main.js";
import { config } from "./config.js";

const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} \n URL: http://localhost:${config.port}`);
});

process.on('SIGINT', () => {
    console.log('Cerrando servidor...');
    server.close(() => process.exit());
});

