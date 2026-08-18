import express from "express";
import { config } from "./config.js";
import usersRouter from "./routers/usersRouters.js";
import userAuthRouter from "./routers/userAuthRouter.js";
import protectedRoutes from "./routers/protectedRoutes.js";
import morgan from "morgan";
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
let corsOptions;

corsOptions = {
  origin: config.baseUrl,
  credentials: true
}

app.use(cors(corsOptions))
app.use(helmet({
  contentSecurityPolicy: config.isProduction,
  crossOriginEmbedderPolicy: config.isProduction,
}))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'production' && process.env.SKIP_LOGS !== 'true') {
  app.use(morgan("dev"));
}

app.use(usersRouter);

app.use('/api/v1/', userAuthRouter);
app.use('/api/v1/', protectedRoutes)

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
