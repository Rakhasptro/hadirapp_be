# Authentication Pages

Halaman login dan register untuk sistem HadirApp.

## Fitur

### 1. Login Form (`src/components/auth/login-form.tsx`)
- Input email dan password
- Validasi form
- Error handling
- Loading state
- Auto-redirect berdasarkan role:
  - ADMIN → `/admin/dashboard`
  - TEACHER → `/teacher/dashboard`
  - STUDENT → `/student/dashboard`

### 2. Register Form (`src/components/auth/register-form.tsx`)
- Input email, password, dan konfirmasi password
- Validasi password (minimal 6 karakter)
- Validasi password match
- Default role: ADMIN
- Success message dengan auto-redirect ke login

### 3. Auth Page (`src/pages/auth-page.tsx`)
- Toggle antara login dan register
- Auto-redirect jika sudah login
- Design gradient dengan branding HadirApp

### 4. Protected Route (`src/components/auth/protected-route.tsx`)
- Middleware untuk proteksi route
- Cek authentication
- Cek authorization berdasarkan role
- Auto-redirect ke login jika belum auth
- Auto-redirect ke unauthorized jika role tidak sesuai

## Services

### Auth Service (`src/lib/auth.ts`)
```typescript
// Login
authService.login({ email, password })

// Register
authService.register({ email, password, role })

// Logout
authService.logout()

// Get token
authService.getToken()

// Get user
authService.getUser()

// Check authentication
authService.isAuthenticated()
```

### Axios Interceptor (`src/lib/axios.ts`)
- Auto-inject Bearer token ke setiap request
- Auto-redirect ke login jika 401 Unauthorized
- Base URL: `http://localhost:3000/api` (dari .env)

## Routing

Route structure:
```
/login                  → Auth Page (public)
/unauthorized          → 403 page (public)
/admin/dashboard       → Admin Dashboard (protected, role: ADMIN)
/teacher/dashboard     → Teacher Dashboard (protected, role: TEACHER)
/student/dashboard     → Student Dashboard (protected, role: STUDENT)
/                      → Auto-redirect based on auth status
```

## Integration dengan Backend

Backend endpoints yang digunakan:
- `POST /api/auth/login`
- `POST /api/auth/register`

### Request/Response Format

**Login:**
```json
// Request
{
  "email": "admin@example.com",
  "password": "password123"
}

// Response
{
  "message": "Login success",
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "role": "ADMIN",
    "profile": null
  }
}
```

**Register:**
```json
// Request
{
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
}

// Response
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

## Testing

### 1. Start Backend
```bash
cd HadirAPP
npm install
npm run start:dev
```

### 2. Start Frontend
```bash
cd web
npm install
npm run dev
```

### 3. Test Flow

1. **Register Admin:**
   - Buka `http://localhost:5173/login`
   - Klik "Daftar di sini"
   - Isi form registrasi
   - Submit → akan redirect ke login

2. **Login:**
   - Isi email dan password yang sudah didaftar
   - Submit → akan redirect ke dashboard sesuai role

3. **Protected Routes:**
   - Coba akses `/admin/dashboard` tanpa login → redirect ke login
   - Login sebagai STUDENT, coba akses `/admin/dashboard` → redirect ke unauthorized

4. **Logout:**
   - Klik avatar di sidebar
   - Klik "Log out"
   - Akan redirect ke login dan token dihapus

## UI Components (shadcn/ui)

Components yang digunakan:
- `Button`
- `Input`
- `Card` (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)

## Environment Variables

File `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

## Storage

Data yang disimpan di localStorage:
- `token`: JWT access token
- `user`: User object (id, email, role, profile)

## Security

- Password minimal 6 karakter
- JWT token disimpan di localStorage
- Token otomatis di-inject ke header Authorization
- Auto-logout pada 401 response
- Protected routes dengan role-based access control
