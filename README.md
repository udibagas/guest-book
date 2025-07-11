# Mitrateknik Guest Book Application

A modern guest book application built for Mitrateknik company to manage visitor registrations.

## Features

- **Home Page**: Displays company greeting and QR code for easy access to guest form
- **Guest Registration**: Form for visitors to fill required information and upload ID photo
- **Admin Dashboard**: View guest list and visit history with filtering capabilities
- **ID Photo Capture**: Integrated camera/file upload for ID verification
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Backend**: Express.js with PostgreSQL and Sequelize ORM
- **Frontend**: React.js with Ant Design UI library
- **Database**: PostgreSQL
- **Deployment**: Monorepo structure for simplified deployment

## Guest Information Collected

- Name (required)
- Phone Number (required)
- Email (required)
- Company (optional)
- Role (required)
- Purpose of Visit (required)
- ID Photo (required)

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm run install:all
   ```

2. **Database Setup**

   - Ensure PostgreSQL is installed and running
   - Create a database named `guest_book`
   - Update database credentials in `server/.env`

3. **Environment Configuration**

   - Copy `server/.env.example` to `server/.env`
   - Update the database connection details:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=guest_book
     DB_USER=your_username
     DB_PASS=your_password
     ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend client (port 3000).

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Production Build

```bash
npm run build
npm run server:start
```

## Project Structure

```
guest-book/
├── server/          # Express.js backend
├── client/          # React.js frontend
└── package.json     # Root package.json for scripts
```

## API Endpoints

- `POST /api/guests` - Register new guest
- `GET /api/guests` - Get all guests (admin)
- `GET /api/guests/:id` - Get specific guest
- `POST /api/upload` - Upload ID photo
