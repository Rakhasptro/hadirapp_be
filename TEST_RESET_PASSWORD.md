# Test Reset Password API

## Endpoint
`POST /api/auth/reset-password`

## Test Cases

### 1. Reset Password untuk Teacher (menggunakan email)

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

**Expected Response:**
```json
{
  "message": "Password berhasil direset",
  "success": true
}
```

### 2. Reset Password untuk Student (menggunakan NPM)

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "npm": "123456789",
    "newPassword": "newPassword456",
    "confirmPassword": "newPassword456"
  }'
```

**Expected Response:**
```json
{
  "message": "Password berhasil direset",
  "success": true
}
```

### 3. Test Error: Password tidak sama

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "newPassword": "newPassword123",
    "confirmPassword": "differentPassword"
  }'
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Password baru dan konfirmasi password tidak sama",
  "error": "Bad Request"
}
```

### 4. Test Error: Email/NPM tidak diisi

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Email (untuk teacher) atau NPM (untuk student) harus diisi",
  "error": "Bad Request"
}
```

### 5. Test Error: Email tidak terdaftar

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notfound@example.com",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "Email tidak terdaftar sebagai teacher",
  "error": "Bad Request"
}
```

### 6. Test Error: NPM tidak terdaftar

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "npm": "999999999",
    "newPassword": "newPassword123",
    "confirmPassword": "newPassword123"
  }'
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": "NPM tidak terdaftar sebagai student",
  "error": "Bad Request"
}
```

### 7. Test Error: Password terlalu pendek

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "newPassword": "123",
    "confirmPassword": "123"
  }'
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": [
    "newPassword must be longer than or equal to 6 characters",
    "confirmPassword must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

## Verification Steps

Setelah reset password berhasil, verifikasi dengan login:

### For Teacher:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "newPassword123"
  }'
```

### For Student:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "newPassword456"
  }'
```

Login harus berhasil dengan password baru.

## Notes

1. **Teacher** menggunakan **email** yang terdaftar di tabel `teachers`
2. **Student** menggunakan **NPM** yang terdaftar di tabel `students`
3. Password baru minimal 6 karakter
4. `newPassword` dan `confirmPassword` harus sama
5. Tidak perlu JWT token untuk reset password (public endpoint)
6. Password akan di-hash menggunakan bcrypt sebelum disimpan
