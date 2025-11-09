# 📱 HadirApp - QR Code Attendance System# HadirApp - Modern Attendance Management System



Sistem absensi modern berbasis QR Code untuk institusi pendidikan. Terdiri dari backend API (NestJS), web application untuk teacher, dan mobile app untuk student.A comprehensive attendance management system built with NestJS (Backend) and React (Frontend), featuring role-based access control, real-time attendance tracking, and schedule management.



## 🎯 Overview## 🚀 Project Structure



HadirApp adalah solusi absensi yang efisien dengan fitur:This is a monorepo containing two main applications:

- ✅ QR Code based attendance

- ✅ Real-time attendance tracking```

- ✅ Selfie verificationhadirapp_db/

- ✅ Teacher dashboard untuk manajemen├── HadirAPP/          # Backend (NestJS + Prisma)

- ✅ Mobile app untuk student├── web/               # Frontend (React + TypeScript)

└── docs/              # Documentation files

## 📂 Struktur Project```



```## ✨ Features

hadirapp_db/

├── HadirAPP/          # Backend API (NestJS + Prisma + MySQL)### Core Features

│   ├── src/- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control (ADMIN, TEACHER, STUDENT)

│   ├── prisma/- 📊 **Unified Dashboard** - Role-specific dashboard with dynamic content

│   └── README.md      # Backend documentation- ✅ **Attendance Management** - Real-time attendance tracking with QR code support

│- 📅 **Schedule Management** - Complete CRUD for class schedules with conflict detection

└── web/               # Teacher Web Dashboard (React + Vite)- 👥 **User Management** - Manage students, teachers, and administrators

    ├── src/- 📱 **Responsive Design** - Mobile-first design with dark mode support

    └── README.md      # Frontend documentation

```### Admin Features

- Dashboard with comprehensive statistics

## 🚀 Quick Start- Attendance session management

- Schedule management with automatic conflict detection

### 1. Backend Setup- User and class management

- Reports and analytics

```bash

# Masuk ke folder backend### Teacher Features

cd HadirAPP- Personal schedule view

- Attendance session creation

# Install dependencies- Student attendance tracking

npm install- Class management



# Setup database (.env)### Student Features

DATABASE_URL="mysql://user:password@localhost:3306/hadirapp"- Personal attendance history

JWT_SECRET="your-secret-key"- Schedule viewing

- Leave request management

# Run migrations

npx prisma migrate dev## 🛠️ Tech Stack



# Start server### Backend

npm run start:dev- **NestJS** - Progressive Node.js framework

```- **Prisma ORM** - Next-generation database toolkit

- **MySQL** - Database

Backend akan berjalan di `http://localhost:3000`- **JWT** - Authentication

- **TypeScript** - Type-safe development

### 2. Web Dashboard Setup

### Frontend

```bash- **React 19** - UI library

# Masuk ke folder web- **TypeScript** - Type-safe development

cd web- **Vite** - Build tool

- **React Router v6** - Routing

# Install dependencies- **shadcn/ui** - UI components

npm install- **Tailwind CSS** - Styling

- **Axios** - HTTP client

# Setup environment (.env)

echo "VITE_API_URL=http://localhost:3000/api" > .env## 📦 Installation



# Start development server### Prerequisites

npm run dev- Node.js (v18 or higher)

```- MySQL (v8 or higher)

- npm or yarn

Web dashboard akan berjalan di `http://localhost:5173`

### Backend Setup

## 🔑 Test Credentials

```bash

```cd HadirAPP

Teacher Account:

Email: teacher1@test.com# Install dependencies

Password: password123npm install

```

# Setup environment variables

## 📱 Fitur Utamacp .env.example .env

# Edit .env with your database credentials

### Teacher (Web App)

1. **Manajemen Jadwal**# Generate Prisma Client

   - Create/Edit/Delete jadwal kuliahnpx prisma generate

   - Generate QR Code otomatis

   - Aktivasi/Deaktivasi QR Code# Run migrations

   - Download QR Codenpx prisma migrate dev



2. **Konfirmasi Kehadiran**# Seed database (optional)

   - Review attendance submissionsnpm run seed

   - View selfie mahasiswa

   - Confirm/Reject attendance# Start development server

npm run start:dev

3. **Profile Management**```

   - Update profile info

   - Upload photoBackend will run on `http://localhost:3000`

   - Change password

### Frontend Setup

### Student (Mobile App)

1. **Scan QR Code**```bash

   - Scan QR dari teachercd web

   - Submit attendance dengan selfie

   - View attendance history# Install dependencies

npm install

2. **Profile**

   - View profile# Setup environment variables (if needed)

   - Update infocp .env.example .env



## 🛠️ Teknologi Stack# Start development server

npm run dev

### Backend```

- NestJS (Node.js framework)

- Prisma ORMFrontend will run on `http://localhost:5173`

- MySQL Database

- JWT Authentication## 🔑 Default Credentials

- Multer (File upload)

- QRCode GeneratorAfter seeding the database:



### Web Frontend**Admin:**

- React 19 + Vite- Email: `admin@school.com`

- TypeScript- Password: `admin123`

- Tailwind CSS + shadcn/ui

- React Router v7**Teacher:**

- Axios- Email: `teacher@school.com`

- Sonner (Toast notifications)- Password: `teacher123`



## 📊 Database Schema**Student:**

- Email: `student@school.com`

```- Password: `student123`

User → TeacherProfile / StudentProfile

Teacher → Schedules (1:N)## 📚 API Documentation

Schedule → Attendances (1:N)

Student → Attendances (1:N)### Authentication

``````

POST /api/auth/login          - Login

## 🔄 QR Code WorkflowPOST /api/auth/register       - Register new user

GET  /api/auth/profile        - Get current user profile

``````

1. Teacher creates schedule → QR Code generated (SCHEDULED)

2. Teacher activates QR → Status: ACTIVE### Admin Endpoints

3. Students scan QR → Submit attendance + selfie```

4. Teacher reviews → Confirm/RejectGET  /api/admin/stats                    - Dashboard statistics

5. Teacher closes QR → Status: CLOSEDGET  /api/admin/attendance/sessions      - List attendance sessions

6. Can reactivate anytime → Status: ACTIVE againGET  /api/admin/attendance/sessions/:id  - Session details

```GET  /api/admin/schedules                - List schedules

POST /api/admin/schedules                - Create schedule

## 📡 API EndpointsPUT  /api/admin/schedules/:id            - Update schedule

DELETE /api/admin/schedules/:id          - Delete schedule

### Authentication```

- `POST /api/auth/login`

- `POST /api/auth/register`### Teacher Endpoints

```

### Schedules (Teacher)GET  /api/teacher/stats                  - Teacher dashboard stats

- `GET /api/schedules`GET  /api/teacher/schedule               - My teaching schedule

- `POST /api/schedules`GET  /api/teacher/attendance/sessions    - My attendance sessions

- `PUT /api/schedules/:id`POST /api/teacher/attendance/sessions    - Create attendance session

- `DELETE /api/schedules/:id````

- `PATCH /api/schedules/:id/status`

## 🗄️ Database Schema

### Attendance

- `GET /api/attendance/pending` (Teacher)Key entities:

- `POST /api/attendance/submit` (Student)- **users** - User authentication

- `PATCH /api/attendance/:id/confirm` (Teacher)- **students** - Student profiles

- `PATCH /api/attendance/:id/reject` (Teacher)- **teachers** - Teacher profiles

- **classes** - School classes

### Profile- **courses** - Subjects/courses

- `GET /api/profile`- **schedules** - Class schedules

- `PUT /api/profile`- **attendance_sessions** - Attendance tracking sessions

- `POST /api/profile/photo`- **attendances** - Individual attendance records

- **leave_requests** - Leave/absence requests

### Public

- `GET /api/public/schedules/verify/:qrCode` (No auth)## 🎨 UI Components



## 🎨 ScreenshotsBuilt with shadcn/ui components:

- Cards, Buttons, Inputs

### Teacher Dashboard- Dropdowns, Modals, Toasts

- Dashboard overview dengan statistik- Tables, Badges, Avatars

- Jadwal list dengan QR Code- Dark mode support

- QR Code activation/deactivation- Responsive design

- Attendance confirmation

## 🔒 Security

### Mobile App (Coming Soon)

- QR Scanner- JWT token-based authentication

- Selfie capture- Role-based access control (RBAC)

- Attendance history- Password hashing with bcrypt

- Environment variable protection

## 📝 Development Status- CORS configuration

- Input validation and sanitization

- ✅ Backend API (100% complete)

- ✅ Web Dashboard (100% complete)## 📈 Development

- ⏳ Mobile App (In development)

### Running Tests

## 🧪 Testing```bash

# Backend tests

### Backendcd HadirAPP

```bashnpm run test

cd HadirAPP

npm run test# Frontend tests

npm run test:e2ecd web

```npm run test

```

### Frontend

```bash### Building for Production

cd web```bash

npm run build# Backend

npm run previewcd HadirAPP

```npm run build



## 📖 Documentation# Frontend

cd web

Untuk dokumentasi lengkap, lihat:npm run build

- [Backend API Documentation](./HadirAPP/README.md)```

- [Web Dashboard Documentation](./web/README.md)

## 🤝 Contributing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Contributions are welcome! Please read the documentation before submitting PR.

## 📝 License

## 👥 Team

This project is licensed under the MIT License.

HadirApp Development Team

## 👥 Authors

## 📄 License

- **Rakha Saputro** - Initial work

MIT License

## 🙏 Acknowledgments

---

- NestJS team for the amazing framework

**Happy Coding! 🚀**- React team for the powerful library

- shadcn for the beautiful UI components
- All contributors and supporters

## 📞 Support

For support, email rakha@example.com or open an issue in the repository.

---

**Built with ❤️ using NestJS, React, and TypeScript**
