import express, { NextFunction, Response } from "express";
import { RequestModel as Request } from "./models/types.js"
import { config } from "./config.js";
import usersRouter from "./routers/usersRouters.js";
import userAuthRouter from "./routers/userAuthRouter.js";
import userProtectedAuthorized from "./routers/userProtectedAuthorized.js";
import path from "path";
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
app.use('/static', express.static(path.join(process.cwd(), "public")));

app.use(morgan("dev"));
app.use(usersRouter);

//block auth for brach origin router
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.includes('/api/v1/')) {
    return res.redirect("/home")
  }
  next();
})

app.use('/api/v1/', userAuthRouter);
app.use('/auth/protected', userProtectedAuthorized)

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).sendFile(path.join(process.cwd(), "public", "error.html"));
});

export default app;     