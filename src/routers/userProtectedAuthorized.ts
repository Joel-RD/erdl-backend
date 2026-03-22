import { Router, Response } from "express";
import { authJWT } from "../Middleware/authJWT.js"
import { RequestModel as Request } from "../models/types.js";

const router = Router();

router.get(`/auth/user/profile`, authJWT, (req: Request, res: Response) => {
    res.json({
        message: "Profile accessed successfully",
        user: {
            email: req.userEmail
        }
    })
});

export default router;
