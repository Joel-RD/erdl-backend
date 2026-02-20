import { Router, Response } from "express";
import { authJWT } from "../Middleware/authJWT.js"
import { RequestModel } from "../models/types.js";

const router = Router();

router.get(`/auth/user/profile`, authJWT, (req: RequestModel, res: Response) => {
    res.send('profile')
});

export default router;  