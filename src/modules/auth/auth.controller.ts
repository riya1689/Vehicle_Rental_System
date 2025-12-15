import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from "../../config/database/database";
import { sendResponse } from "../../utils/response";

export const signup = async (req: Request, res: Response) => {
    try{
        const {name, email, password, phone, role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users(name, email, password, phone, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, phone, role
        `;
        const result = await pool.query(query,[name, email.toLowerCase(), hashedPassword, phone, role || 'customer']);
        sendResponse(res, 201, true, "User registered successfully", result.rows[0]);

    }
    catch(error: any){
        if(error.code == '23505'){
            return sendResponse(res, 400, false, error.message);
        }
        sendResponse(res, 500, false, error.message);
    }
};

export const signin = async(req: Request, res: Response) =>{
    try{
        const {email, password} = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email =$1', [email.toLowerCase()]);
        const user = result.rows[0];
        if(!user || !(await bcrypt.compare(password, user.password))){
            return sendResponse(res, 401, false, "Invalid credentials");
        }
        const token = jwt.sign(
           {id: user.id, role: user.role, email: user.email},
           process.env.JWT_SECRET as string,
           {expiresIn: '20d'}

        );
        delete user.password;
        sendResponse(res, 200, true, "Login successful", { token, user});
    }catch (error: any){
        sendResponse(res, 500, false, error.message);
    }
};