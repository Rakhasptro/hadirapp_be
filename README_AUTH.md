# 🎓 HadirApp - Authentication System

Sistem login dan register untuk aplikasi HadirApp dengan integrasi penuh ke backend NestJS.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Database (PostgreSQL/MySQL - configured in backend)

### Installation & Running

**1. Install Dependencies**
```bash
# Backend
cd HadirAPP
npm install

# Frontend
cd web
npm install
```

**2. Start Backend**
```bash
cd HadirAPP
npm run start:dev
```
Backend akan berjalan di: `http://localhost:3000`

**3. Start Frontend**
```bash
cd web
npm run dev
```
Frontend akan berjalan di: `http://localhost:5173`

**4. Open Browser**
```
http://localhost:5173
```

## ✨ Features

### Authentication
- ✅ **Login** - Email & password authentication
- ✅ **Register** - Create new admin account
- ✅ **Logout** - Clear session & redirect
- ✅ **Auto-login** - Persistent authentication via JWT
- ✅ **Password Toggle** - Show/hide password visibility

### Authorization
- ✅ **Protected Routes** - Route guards for authenticated pages
- ✅ **Role-based Access** - ADMIN, TEACHER, STUDENT roles
- ✅ **Auto-redirect** - Redirect to appropriate dashboard based on role
- ✅ **Unauthorized Page** - 403 page for invalid access

### Security
- ✅ **JWT Tokens** - Secure token-based authentication
- ✅ **Password Validation** - Minimum 6 characters
- ✅ **Auto-logout** - Logout on 401 responses
- ✅ **CORS Protection** - Configured for frontend origin
- ✅ **HTTP-only Cookies Ready** - Can be configured for production

### UI/UX
- ✅ **Responsive Design** - Works on mobile, tablet, desktop
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Loading States** - Visual feedback during operations
- ✅ **Error Handling** - Clear error messages
- ✅ **Form Validation** - Client-side validation
- ✅ **shadcn/ui Components** - Modern, accessible components

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [AUTH_README.md](web/AUTH_README.md) | Complete authentication documentation |
| [QUICK_START.md](QUICK_START.md) | Quick testing guide |
| [VISUAL_GUIDE.md](web/VISUAL_GUIDE.md) | UI previews & flow diagrams |
| [TROUBLESHOOTING.md](web/TROUBLESHOOTING.md) | Common issues & solutions |
| [CHECKLIST.md](CHECKLIST.md) | Implementation checklist |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Summary of changes |

## 📁 Project Structure

```
├── HadirAPP/                    # Backend (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   └── auth/            # Auth module
│   │   │       ├── auth.controller.ts
│   │   │       ├── auth.service.ts
│   │   │       └── auth.module.ts
│   │   └── main.ts              # CORS configuration
│   └── prisma/
│       └── schema.prisma        # Database schema
│
└── web/                         # Frontend (React + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── auth/            # Auth components
    │   │   │   ├── login-form.tsx
    │   │   │   ├── register-form.tsx
    │   │   │   └── protected-route.tsx
    │   │   └── ui/              # shadcn/ui components
    │   ├── lib/
    │   │   ├── auth.ts          # Auth service
    │   │   └── axios.ts         # HTTP client with interceptors
    │   ├── pages/
    │   │   └── auth-page.tsx    # Auth page container
    │   ├── router.tsx           # Route configuration
    │   └── main.tsx             # App entry point
    ├── .env                     # Environment variables
    └── package.json
```

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **NestJS** - Node.js framework
- **Prisma** - ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **PostgreSQL/MySQL** - Database

## 📸 Screenshots

### Login Page
```
┌─────────────────────────────────┐
│         HadirApp               │
│  Sistem Manajemen Kehadiran   │
│                                 │
│  ┌───────────────────────────┐ │
│  │  Login                    │ │
│  │  Masuk ke akun Anda       │ │
│  │                           │ │
│  │  Email: [            ]    │ │
│  │  Password: [        ] 👁️  │ │
│  │                           │ │
│  │  [ Login ]                │ │
│  │                           │ │
│  │  Belum punya akun?        │ │
│  │  Daftar di sini           │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔄 User Flow

```
Start → /login
  ├─ Register → Form → Success → /login
  └─ Login → Form → Success
      ├─ ADMIN → /admin/dashboard
      ├─ TEACHER → /teacher/dashboard
      └─ STUDENT → /student/dashboard
```

## 🧪 Testing

### Manual Testing

**Register New Admin:**
1. Go to `/login`
2. Click "Daftar di sini"
3. Fill form:
   - Email: `admin@test.com`
   - Password: `admin123`
   - Confirm Password: `admin123`
4. Click "Daftar"
5. ✅ Should see success message
6. ✅ Should redirect to login

**Login:**
1. Enter email: `admin@test.com`
2. Enter password: `admin123`
3. Click "Login"
4. ✅ Should redirect to `/admin/dashboard`
5. ✅ Should see user info in sidebar

**Protected Routes:**
1. Logout
2. Try accessing `/admin/dashboard`
3. ✅ Should redirect to `/login`

**Logout:**
1. Click avatar in sidebar
2. Click "Log out"
3. ✅ Should redirect to `/login`
4. ✅ Token should be cleared

## 🔐 API Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login success",
  "access_token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "admin@test.com",
    "role": "ADMIN",
    "profile": null
  }
}
```

## 🌐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hadirapps"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 🐛 Troubleshooting

**CORS Error?**
- Check backend CORS configuration in `main.ts`
- Ensure frontend origin is allowed

**Can't Login?**
- Check backend logs
- Verify credentials are correct
- Check database connection

**Protected Routes Not Working?**
- Check localStorage for token
- Verify token is being sent in Authorization header

For more issues, see [TROUBLESHOOTING.md](web/TROUBLESHOOTING.md)

## 📝 Next Steps

- [ ] Email verification
- [ ] Forgot password
- [ ] Two-factor authentication
- [ ] Social login (Google, Facebook)
- [ ] User profile page
- [ ] Change password
- [ ] Remember me functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Backend: NestJS + Prisma
- Frontend: React + shadcn/ui

---

**Made with ❤️ for HadirApp**
