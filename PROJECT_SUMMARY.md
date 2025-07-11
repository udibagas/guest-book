# 🎯 Mitrateknik Guest Book - Complete Application

Your guest book application has been successfully created with Vite + React frontend and Express.js backend!

## 📦 What's Included

### Backend (Express.js + PostgreSQL + Sequelize)

- **RESTful API** for guest management
- **File upload** for ID photos with validation
- **Database models** with Sequelize ORM
- **Input validation** with express-validator
- **Error handling** and logging
- **CORS** and security middleware

### Frontend (React + Vite + Ant Design)

- **Home Page** with QR code for easy access
- **Guest Registration Form** with photo capture/upload
- **Admin Dashboard** with guest management
- **Responsive design** for mobile and desktop
- **Real-time stats** and filtering
- **Modern UI** with Ant Design components

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm run install:all
   ```

2. **Setup database:**

   - Install PostgreSQL if not already installed
   - Create database: `createdb guest_book`
   - Update credentials in `server/.env`

3. **Start development:**

   ```bash
   npm run dev
   ```

4. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Admin Panel: http://localhost:3000/admin

## 🗂️ Project Structure

```
guest-book/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── pages/         # Home, GuestForm, Admin
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Express.js backend
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── uploads/          # File storage
│   └── package.json      # Backend dependencies
├── package.json          # Root scripts
└── README.md            # Documentation
```

## 🔧 Configuration

### Database (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=guest_book
DB_USER=your_username
DB_PASS=your_password
```

### Features Included

- ✅ Guest registration with validation
- ✅ ID photo upload/capture
- ✅ QR code generation
- ✅ Admin dashboard
- ✅ Guest check-in/check-out
- ✅ Real-time statistics
- ✅ Search and filtering
- ✅ Responsive design
- ✅ File upload validation
- ✅ Modern UI components

## 📱 Usage

### For Guests:

1. Scan QR code or visit the website
2. Fill registration form with required information
3. Upload or capture ID photo
4. Submit to complete check-in

### For Admins:

1. Visit `/admin` route
2. View guest statistics
3. Manage guest records
4. Check out visitors
5. Filter and search guests

## 🛠️ Development Commands

```bash
npm run dev          # Start both frontend and backend
npm run server:dev   # Start only backend
npm run client:dev   # Start only frontend
npm run build        # Build frontend for production
npm run server:start # Start production server
```

## 🔒 Security Features

- Input validation and sanitization
- File upload restrictions (size, type)
- CORS configuration
- Helmet security headers
- SQL injection protection with Sequelize

## 📸 Photo Handling

- Webcam integration for live photo capture
- File upload with drag & drop
- Image validation (type, size)
- Automatic file naming and storage
- Preview functionality

Your application is ready to use! 🎉
