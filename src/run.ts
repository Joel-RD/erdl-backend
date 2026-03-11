import app from "./main.js";
import { config } from "./config.js";
import { logger, log } from "./utils/logger.js";

const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`, { 
        url: `http://localhost:${config.port}/home`,
        environment: process.env.NODE_ENV || 'development'
    });
    log.info(`🚀 Aplicación iniciada correctamente en puerto ${config.port}`);
});

// Ejemplo de uso del logger en diferentes niveles
log.info('Mensaje de información general');
log.warn('Esto es una advertencia');
log.error('Esto es un error de ejemplo');
log.debug('Debug message - solo visible en desarrollo');

// Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('SIGINT', () => {
    logger.info('Cerrando servidor...');
    server.close(() => process.exit());
});
