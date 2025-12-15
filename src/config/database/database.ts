import {Pool} from "pg";
import dotenv from "dotenv";
dotenv.config();
const pool = new Pool({
    connectionString: process.env.CONNECTION_STRING,
    ssl:{
        rejectUnauthorized: false
    }
});

const initDB = async () =>{

    try{
            await pool.query(
        `
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer'
        )
        `
    );

    await pool.query(
        `
        CREATE TABLE IF NOT EXISTS vehicles(
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(255) NOT NULL,
        type VARCHAR(55) NOT NULL,
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        daily_rent_price INTEGER NOT NULL,
        availability_status VARCHAR (20) DEFAULT 'available'
        )
        `
    );

    await pool.query(
        `
        CREATE TABLE IF NOT EXISTS bookings(
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        rent_start_date TIMESTAMP NOT NULL,
        rent_end_date TIMESTAMP NOT NULL,
        total_price INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active'
        )
        `
    );
    
    }catch (error){
        console.error("Error creating tables: ", error)
    }
    
};


const testConnection = async() => {
    try{
        const client = await pool.connect();
        console.log('DB is connected')
        client.release();
        await initDB();
    }
    catch(err: any){
        console.error('DB not connected')
        process.exit(1)
    }
}

testConnection();
export default pool;