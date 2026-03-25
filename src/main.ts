import express, { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import usersRouter from "./routers/usersRouters.js";
import userAuthRouter from "./routers/userAuthRouter.js";
import userProtectedAuthorized from "./routers/userProtectedAuthorized.js";
import morgan from "morgan";
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();
const corsOptions = ({
  origin: config.baseUrl,
  credentials: true
})

app.set('trust proxy', true)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use(usersRouter);

app.use('/api/v1/', userAuthRouter);
app.use('/api/v1/', userProtectedAuthorized)

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found` 
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: "An unexpected error occurred" 
  });
});

export default app;
