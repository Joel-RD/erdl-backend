import winston from 'winston';
import path from 'path';

// Get directory - check if import.meta is available
const isESM = typeof import.meta !== 'undefined' && import.meta.url;
const appDirname = isESM 
  ? path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')
  : process.cwd();

const isProduction = process.env.NODE_ENV === 'Production' || process.env.NODE_ENV === 'production';

// Formato para desarrollo - legible y con colores
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      msg += `\n${stack}`;
    }
    return msg;
  })
);

// Formato para producción - JSON estructurado
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuración de archivos rotativos
const getFileTransportOptions = (filename: string): winston.transports.FileTransportOptions => ({
  filename,
  dirname: path.join(appDirname, '../../logs'),
  maxsize: 5 * 1024 * 1024, // 5MB
  maxFiles: 5,
});

// Crear el logger
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: { service: 'shortener-url' },
  transports: [
    // Transport para errores
    new winston.transports.File({
      ...getFileTransportOptions('error.log'),
      level: 'error',
    }),
    // Transport para todos los logs
    new winston.transports.File({
      ...getFileTransportOptions('combined.log'),
    }),
  ],
});

// Agregar transport de consola en desarrollo
if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: devFormat,
    })
  );
}

// Logger personalizado que exporta métodos convenientes
export const log = {
  info: (message: string, meta?: Record<string, unknown>) => logger.info(message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta),
  error: (message: string, meta?: Record<string, unknown>) => logger.error(message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta),
};

// Exportar logger completo y funciones individuales
export { logger };
export default logger;
