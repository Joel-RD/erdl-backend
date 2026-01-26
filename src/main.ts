import express, { NextFunction, Request, Response } from "express";
import { config } from "./config";
import usersRouter from "./routers/usersRouters";
import path from "path";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "src", "public")));

app.use(morgan("dev"));
app.use(usersRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).sendFile(path.join(process.cwd(), "src", "public", "error.html"));
});

export default app;