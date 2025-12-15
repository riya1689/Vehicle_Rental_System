import {  Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request{
    user?:{
        id: number;
        email: string;
        role: string;
    }
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) =>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Unauthorized Access'
        });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.user = decoded;
        next();
    }catch(err){
        return res.status(401).json({
            success: false,
            message: 'Invalid Token'
        });
    }

};

export const authorize = (requiredRole: string) =>{
    return (req: AuthRequest, res: Response, next: NextFunction) =>{
        if(!req.user || req.user.role !== requiredRole){

            return res.status(403).json({
                success: false,
                message: 'Forbidden Insufficient Permissions'
            });
        }
        next();
    };
};