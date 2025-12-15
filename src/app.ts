import express, {Request, Response, NextFunction, Application} from 'express';
import cors from 'cors';
import {signup, signin} from './modules/auth/auth.controller';
import {createVehicle, getAllVehicles, UpdateVehicles, DeleteVehicles, getVehicleById} from './modules/vehicles/vehicle.controller';
import { createBooking, getAllBookings, updateBookingStatus} from './modules/bookings/booking.controller';
import { verifyToken, authorize } from './middlewares/auth';
import { deleteUser, getAllUsers, updateUser } from './modules/users/user.controller';
const app: Application = express();
app.use(express.json());
app.use(cors());

app.post('/api/v1/auth/signup', signup);
app.post('/api/v1/auth/signin', signin);

app.get('/api/v1/users', verifyToken, authorize('admin'), getAllUsers);
app.put('/api/v1/users/:userId', verifyToken, authorize('admin'), updateUser);
app.delete('/api/v1/users/:userId', verifyToken, authorize('admin'), deleteUser);


app.get('/api/v1/vehicles', getAllVehicles);
app.get('/api/v1/vehicles/:vehicleId', getVehicleById);
app.post('/api/v1/vehicles', verifyToken, authorize('admin'), createVehicle);
app.put('/api/v1/vehicles/:vehicleId', verifyToken, authorize('admin'), UpdateVehicles);
app.delete('/api/v1/vehicles/:vehicleId', verifyToken, authorize('admin'), DeleteVehicles);

app.post('/api/v1/bookings', verifyToken, createBooking);
app.get('/api/v1/bookings', verifyToken, getAllBookings);
app.put('/api/v1/bookings/:bookingId', verifyToken, updateBookingStatus);


app.get('/', (req: Request, res: Response) =>{
    res.send('Vehicle Rental System API is Running');
});

app.use((err: any, req: Request, res: Response, next: NextFunction)=>{
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

export default app;