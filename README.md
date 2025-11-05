# HadirApp - Modern Attendance Management System

A comprehensive attendance management system built with NestJS (Backend) and React (Frontend), featuring role-based access control, real-time attendance tracking, and schedule management.

## 🚀 Project Structure

This is a monorepo containing two main applications:

```
hadirapp_db/
├── HadirAPP/          # Backend (NestJS + Prisma)
├── web/               # Frontend (React + TypeScript)
└── docs/              # Documentation files
```

## ✨ Features

### Core Features
- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control (ADMIN, TEACHER, STUDENT)
- 📊 **Unified Dashboard** - Role-specific dashboard with dynamic content
- ✅ **Attendance Management** - Real-time attendance tracking with QR code support
- 📅 **Schedule Management** - Complete CRUD for class schedules with conflict detection
- 👥 **User Management** - Manage students, teachers, and administrators
- 📱 **Responsive Design** - Mobile-first design with dark mode support

### Admin Features
- Dashboard with comprehensive statistics
- Attendance session management
- Schedule management with automatic conflict detection
- User and class management
- Reports and analytics

### Teacher Features
- Personal schedule view
- Attendance session creation
- Student attendance tracking
- Class management

### Student Features
- Personal attendance history
- Schedule viewing
- Leave request management

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma ORM** - Next-generation database toolkit
- **MySQL** - Database
- **JWT** - Authentication
- **TypeScript** - Type-safe development

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool
- **React Router v6** - Routing
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

```bash
cd HadirAPP

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed

# Start development server
npm run start:dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Setup environment variables (if needed)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Default Credentials

After seeding the database:

**Admin:**
- Email: `admin@school.com`
- Password: `admin123`

**Teacher:**
- Email: `teacher@school.com`
- Password: `teacher123`

**Student:**
- Email: `student@school.com`
- Password: `student123`

## 📚 API Documentation

### Authentication
```
POST /api/auth/login          - Login
POST /api/auth/register       - Register new user
GET  /api/auth/profile        - Get current user profile
```

### Admin Endpoints
```
GET  /api/admin/stats                    - Dashboard statistics
GET  /api/admin/attendance/sessions      - List attendance sessions
GET  /api/admin/attendance/sessions/:id  - Session details
GET  /api/admin/schedules                - List schedules
POST /api/admin/schedules                - Create schedule
PUT  /api/admin/schedules/:id            - Update schedule
DELETE /api/admin/schedules/:id          - Delete schedule
```

### Teacher Endpoints
```
GET  /api/teacher/stats                  - Teacher dashboard stats
GET  /api/teacher/schedule               - My teaching schedule
GET  /api/teacher/attendance/sessions    - My attendance sessions
POST /api/teacher/attendance/sessions    - Create attendance session
```

## 🗄️ Database Schema

Key entities:
- **users** - User authentication
- **students** - Student profiles
- **teachers** - Teacher profiles
- **classes** - School classes
- **courses** - Subjects/courses
- **schedules** - Class schedules
- **attendance_sessions** - Attendance tracking sessions
- **attendances** - Individual attendance records
- **leave_requests** - Leave/absence requests

## 🎨 UI Components

Built with shadcn/ui components:
- Cards, Buttons, Inputs
- Dropdowns, Modals, Toasts
- Tables, Badges, Avatars
- Dark mode support
- Responsive design

## 🔒 Security

- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Environment variable protection
- CORS configuration
- Input validation and sanitization

## 📈 Development

### Running Tests
```bash
# Backend tests
cd HadirAPP
npm run test

# Frontend tests
cd web
npm run test
```

### Building for Production
```bash
# Backend
cd HadirAPP
npm run build

# Frontend
cd web
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Rakha Saputro** - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- React team for the powerful library
- shadcn for the beautiful UI components
- All contributors and supporters

## 📞 Support

For support, email rakha@example.com or open an issue in the repository.

---

**Built with ❤️ using NestJS, React, and TypeScript**
