import { Request, Response } from "express";
import pool from "../../config/database/database";
import {sendResponse} from "../../utils/response"

const updateOverBookings = async()=>{
    try{
        const query =`
        WITH overdue_bookings AS (
        UPDATE bookings SET
        status = 'returned' WHERE rent_end_date < NOW() AND status = 'active'
        RETURNING vehicle_id

        )
        UPDATE vehicles
        SET availability_status = 'available'
        WHERE id IN (SELECT vehicle_id FROM overdue_bookings)
        `;
        await pool.query(query);
    }catch(error){
        console.error("Error updating overdue bookings", error);
    }
};

export const createVehicle = async (req: Request, res: Response) => {
    try{
        const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body;
        const query = `
            INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query,[vehicle_name, type, registration_number, daily_rent_price,availability_status || 'available']);
        sendResponse(res, 201, true, "Vehicle created successfully", result.rows[0]);
    }
    catch(error: any){
        sendResponse(res, 500, false, error.message);
    }
};

export const getAllVehicles = async(req: Request, res: Response) =>{
    try{
        await updateOverBookings();
        const result = await pool.query('SELECT * FROM vehicles ORDER BY id ASC');
        if(result.rows.length === 0){
            return sendResponse(res, 200, true, "No vehicles found", []);
        }
        sendResponse(res, 200, true, "Vehicles retrieved successfully", result.rows);
    }catch (error: any){
        sendResponse(res, 500, false, error.message);
    }
};

export const UpdateVehicles = async(req: Request, res: Response) =>{
    try{
        const {vehicleId} = req.params;
        const {vehicle_name, daily_rent_price, availability_status} = req.body;
        const oldVehicleResult = await pool.query('SELECT * FROM vehicles WHERE id =$1', [vehicleId]);
        if(oldVehicleResult.rows.length === 0){
            return sendResponse(res, 404, false, "Vehicle not found");
        }
        const oldData = oldVehicleResult.rows[0];
        const newName = vehicle_name || oldData.vehicle_name;
        const newPrice = daily_rent_price || oldData.daily_rent_price;
        const newStatus = availability_status || oldData.availability_status;
        const query =`
        UPDATE vehicles
        SET vehicle_name = $1,
            daily_rent_price = $2,
            availability_status = $3
            WHERE id = $4
            RETURNING *
        `;
        const result = await pool.query(query, [newName, newPrice, newStatus, vehicleId]);

        sendResponse(res, 200, true, "Vehicle updated successfully", result.rows[0]);
    }catch (error: any){
        sendResponse(res, 500, false, error.message);
    }
};

export const DeleteVehicles = async(req: Request, res: Response) =>{
    try{
        const {vehicleId} = req.params;
        const checkQuery =`SELECT * FROM bookings WHERE vehicle_id = $1 AND status = 'active'`;
        const checkResult = await pool.query(checkQuery, [vehicleId]);
        if(checkResult.rows.length > 0){
            return sendResponse(res, 400, false, "Cannot delete vehicle with active bookings");
        }

        const query = `DELETE FROM vehicles WHERE id =$1 RETURNING *`;
        const result = await pool.query(query, [vehicleId]);
        if(result.rowCount === 0){
            return sendResponse(res, 404, false, "No vehicles found", []);
        }
        sendResponse(res, 200, true, "Vehicles deleted successfully", result.rows);
    }catch (error: any){
        sendResponse(res, 500, false, error.message);
    }
};

export const getVehicleById = async(req: Request, res: Response) =>{
    try{
        const {vehicleId} = req.params;
        const result = await pool.query('SELECT * FROM vehicles WHERE id =$1', [vehicleId]);
    
        if(result.rows.length === 0){
            return sendResponse(res, 400, false, "Vehicle not found");
        }
        sendResponse(res, 200, true, "Vehicles retrieved successfully", result.rows[0]);
    }catch (error: any){
        sendResponse(res, 500, false, error.message);
    }
};