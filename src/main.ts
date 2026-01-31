import express, { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import usersRouter from "./routers/usersRouters.js";
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
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use(morgan("dev"));
app.use(usersRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).sendFile(path.join(process.cwd(), "src", "public", "error.html"));
});

export default app;