import { Router, Response } from "express";
import { authJWT } from "../middleware/authJWT.js"
import { RequestModel as Request } from "../models/types.js";
import { sendOk } from "../utils/responseFormat.js";

const router = Router();

router.get(`/auth/user/profile`, authJWT, (req: Request, res: Response) => {
    return sendOk(res, { user: { email: req.userEmail } }, "Perfil consultado correctamente");
});

export default router;