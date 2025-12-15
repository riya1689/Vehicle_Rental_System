import { Request, Response } from "express";
import pool from '../../config/database/database';
import { sendResponse } from "../../utils/response";

export const createBooking =async (req: Request, res: Response)=>{

    try{
        const{customer_id, vehicle_id, rent_start_date, rent_end_date} = req.body;
        const start = new Date(rent_start_date);
        const end = new Date(rent_end_date);
        const durationInMs = end.getTime() - start.getTime();
        const days = Math.ceil(durationInMs/(1000* 60* 60* 24));
        if (days <=0) return sendResponse(res, 400, false, "End date must be after start date");
        // await client.query('BEGIN');
        const vehicleCheck = await pool.query(
            `
            SELECT daily_rent_price, availability_status, vehicle_name FROM vehicles WHERE id = $1`,
            [vehicle_id]
            
        );
        if(vehicleCheck.rows.length === 0){
            throw new Error("Vehicle not found");
        }

        const {daily_rent_price, availability_status, vehicle_name} = vehicleCheck.rows[0];
        if(availability_status !== 'available'){
            throw new Error("Vehicle is already booked");
        }
        const total_price = daily_rent_price* days;
        const insertBookingQuery=`
        INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
        VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING *
        `;
        const bookingResult = await pool.query(insertBookingQuery, [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]);
        await pool.query(`UPDATE vehicles SET availability_status = 'booked' WHERE id =$1`, [vehicle_id]);
        const responseData={
            ...bookingResult.rows[0],
            vehicle:{ vehicle_name, daily_rent_price}
        };
        sendResponse(res, 201, true, "Booking created successfully", responseData);
    }
    catch(error: any){
        sendResponse (res, 500, false, error.message);
    }
    
};

export const getAllBookings = async(req: Request, res: Response)=>{
    try{
        const userId = (req as any).user.id;
        const role = (req as any).user.role;

        let query = '';
        let params: any[] = [];

        if(role === 'admin'){
            query=`
            SELECT b.*,
            u.name as customer_name, u.email as customer_email,
            v.vehicle_name, v.registration_number
            FROM bookings b
            JOIN users u ON b.customer_id = u.id
            JOIN vehicles v ON b.vehicle_id = v.id
            `;
        }else{
            query =`
            SELECT b.*, v.vehicle_name, v.registration_number, v.type
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            WHERE b.customer_id = $1
            `;
            params =[userId];
        }
        const result = await pool.query(query, params);
        sendResponse(res, 200, true, role === 'admin'? "Booking retrieved successfully" : "Your bookings retrieved successfully", result.rows);
    }catch(error: any){
        sendResponse(res, 500, false, error.message);
    }
    
};

export const updateBookingStatus = async (req: Request, res: Response) =>{
    
    try{
        const {bookingId} = req.params;
        const {status} = req.body;
        const updateBooking =`
        UPDATE bookings SET status =$1
        WHERE id =$2
        RETURNING *
        `;
        const bookingResult = await pool.query(updateBooking, [status, bookingId]);
        if(bookingResult.rowCount === 0) throw new Error("Booking not found");
        const booking = bookingResult.rows[0];
        let vehicleUpdate = null;
        if(status === 'returned' || status === 'cancelled'){
           const vehicleResult = await pool.query(
                `
                UPDATE vehicles SET availability_status = 'available' WHERE id = $1
                RETURNING availability_status
                `, [booking.vehicle_id]
            );
            vehicleUpdate = vehicleResult.rows[0];
        }
        const responseData ={
            ...booking, vehicle: vehicleUpdate?{availability_status: vehicleUpdate.availability_status}: undefined
        };
        sendResponse(res, 200, true, `Booking marked as ${status}`, responseData);
    }
    catch(error: any){
        sendResponse(res, 500, false, error.message);

    }
};