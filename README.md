# Vehicle Rental System
## Overview

**Vehicle Rental System** is maintainable and secure backend API built using Node.js, TypeScript, PostgreSQL(Neon DB).
This rental system handles role-based access,  vehicles management, customers, bookings and authentication.
## Live Demo
Live URL: [https://vehicle-rental-system-rxdy-ojv1rj1x1-riya-das-projects.vercel.app/](https://vehicle-rental-system-rxdy-ojv1rj1x1-riya-das-projects.vercel.app/)
---

## Technology Stack

- **TypeScript + Node.js**: Language and Runtime
- **Express.js**: web framework
- **PostgreSQL**: Database
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **Vercel**: Deployment
## Key Features

1. **Authentication**  
   Secure signup/signin using JWT and bcrypt.

2. **Role-Based Access Control**  
   Admin can manages users,vehicles, view all bookings.
   Customer can book vehicle, browse vehicle, view own booking history.

3. **Auto Return Logic**  
    System automatically frees up vehicles when their rental period expires.
   

4. **User & business rules Based Update Booking**  
   While user cancel booking and admin mark as returned then vehicle will available .

5.  **Status Management**
    Booking system has different type status .Active, Returned,Cancelled, available

6. **Vehicle Management**
    Maintain Full CRUD operations.

## Setup & Usage Instruction
1. **Clone the Repository**  
   ```bash
   git clone https://github.com/riya1689/Vehicle_Rental_System.git
   cd vehicle_rental_system
   ````
2. **Install Dependencies**  
   ````
    npm install
   ````


3.  **Environment Variables**  
   Create `.env` file in the root directory:
   ````
    PORT = 5000
    CONNECTION_STRING=postgres://user:password@endpoint.neon.tech/neondb?sslmode=require
    JWT_SECRET=your_super_secret_key
   ````
4.  **Database Setup**
   Ensure your database is running and the connection string is correctly in the `.env` file.<br>
   Database tables are created automatically when the application starts.
5.  **Run the Server** 
   Development Mode:
   ````
    npm run dev
   ````
   Production Build:
   ````
    npm run build
   ````

## API Endpoints
### Authentication
`POST /api/v1/auth/signup`- Public - Register a new user <br>
`POST /api/v1/auth/signin`- Public - Login and get JWT
### Vehicles
`POST /api/v1/vehicles`- Admin only - Add a vehicle <br>
`GET /api/v1/vehicles`- Public - List all vehicles<br>
`GET /api/v1/vehicles/:vehicleId`- Public - Get vehicle details<br>
`PUT /api/v1/vehicles/:vehicleId`- Admin only - Update vehicle details<br>
`DELETE /api/v1/vehicles/:vehicleId`- Admin only - Remove a vehicle

### Users
`GET /api/v1/users`- Admin only - View all users<br>
`PUT /api/v1/users/:userId`- Admin or Own - Update profile<br>
`DELETE /api/v1/users/:userId`- Admin only - Delete user<br>
### Bookings
`POST /api/v1/bookings`- Admin or customer - Create a rental booking<br>
`GET /api/v1/bookings`- Role-based - View bookings<br>
`PUT /api/v1/bookings/:bookingId`- Role-based - Return or cancel booking.