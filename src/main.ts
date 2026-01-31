import express, { NextFunction, Request, Response } from "express";
import { config } from "./config";
import usersRouter from "./routers/usersRouters";
import userAuthRouter from "./routers/userAuthRouter";
import path from "path";
import morgan from "morgan";
import cors from "cors"

const app = express();
const corsOptions = ({
  origin: config.baseUrl
})

app.set('true proxy', true)
app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(process.cwd(), "public")));

app.use(morgan("dev"));
app.use(usersRouter);
app.use('/api/v1/', userAuthRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).sendFile(path.join(process.cwd(), "public", "error.html"));
});

export default app; 