import { Request, Response, NextFunction } from 'express';

export const verifyEmailMiddleware = (userEmail: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log(userEmail);
        
        if (!userEmail) {
            res.redirect("/api/v1/auth");
            return;
        }
        
        next();
    };
};
