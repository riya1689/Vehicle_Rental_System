import { Request, Response } from "express";
import pool from "../../config/database/database";
import { sendResponse } from "../../utils/response";

export const getAllUsers = async(req: Request, res: Response)=>{
    try{
        const result = await pool.query('SELECT id, name, email, phone, role FROM users');
        sendResponse(res, 200, true, "Users retrieved successfully", result.rows);
    }
    catch(error: any){
        sendResponse(res, 500, false, error.message);
    }
};

export const updateUser = async(req: Request, res: Response) =>{
    try{
        const{ userId} = req.params;
        const { name, email, phone, role} = req.body;
        const requesterId = (req as any).user.id;
        const requesterRole = (req as any).user.role;

        if(requesterRole !== 'admin' && parseInt(userId as string) !== requesterId){
            return sendResponse(res, 403, false,"You are not authorized to update this profile");
        }

        if(role && requesterRole !== 'admin'){
            return sendResponse(res, 403, false,"Only admins can change user roles");
        }

        const findUserQuery = 'SELECT * FROM users WHERE id =$1';
        const findResult = await pool.query(findUserQuery, [userId]);

        if(findResult.rowCount === 0){
            return sendResponse(res, 404, false, "User not found");
        }
        const existUser = findResult.rows[0];
        const newName = name || existUser.name;
        const newEmail = email || existUser.email;
        const newPhone = phone || existUser.phone;
        const newRole = role || existUser.role;
        const updateQuery=`
        UPDATE users SET
        name = $1,
        email = $2,
        phone = $3,
        role = $4
        WHERE id = $5
        RETURNING id, name, email, phone, role
        `;
        const result = await pool.query(updateQuery,[newName, newEmail, newPhone, newRole, userId]);
        sendResponse(res, 200, true,"User Updated successfully", result.rows[0]);
    }
    catch(error: any){
        sendResponse(res, 500, false, error.message);
    }
};

export const deleteUser = async(req: Request, res: Response) =>{
    try{
        const{userId} = req.params;
        const bookingCheck = await pool.query("SELECT * FROM bookings WHERE customer_id =$1 AND status ='active'", [userId]);
        if(bookingCheck.rows.length > 0){
            return sendResponse (res, 400, false, "Cannot delete user with active bookings");
        }

        const result = await pool.query("DELETE FROM users WHERE id =$1 RETURNING id", [userId]);

        if(result.rowCount === 0){
            return sendResponse(res, 404, false, "User not found");
        }
        sendResponse(res, 200, true, "User deleted successfully");
    }catch(error: any){
        sendResponse(res, 500, false, error.message);
    }
};