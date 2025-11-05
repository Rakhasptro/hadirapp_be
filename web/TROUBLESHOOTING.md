# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. ❌ Backend Connection Failed

**Symptoms:**
- Network error di console
- "Failed to fetch" error
- CORS error

**Solutions:**

```bash
# Check if backend is running
curl http://localhost:3000/api

# If not running, start backend
cd HadirAPP
npm run start:dev

# Check .env file in web folder
cat web/.env
# Should contain: VITE_API_URL=http://localhost:3000/api
```

**CORS Error Fix:**
File: `HadirAPP/src/main.ts` harus mengandung:
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```

---

### 2. ❌ Register Failed: "Email already registered"

**Symptoms:**
- Error message saat register
- "Email already registered"

**Solutions:**

```bash
# Option 1: Use different email
# Try: admin2@test.com, test@example.com, etc.

# Option 2: Delete existing user from database
# Connect to your database and delete the user
# Or reset the database
```

---

### 3. ❌ Login Failed: "Invalid credentials"

**Symptoms:**
- Error message saat login
- "Email atau password salah"

**Possible Causes:**
1. Email/password salah → Double check credentials
2. User belum register → Register terlebih dahulu
3. Database issue → Check backend logs

**Debug Steps:**

```bash
# Check backend logs
# Backend should show any errors

# Test API directly
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

---

### 4. ❌ Page Not Found / Blank Screen

**Symptoms:**
- White screen
- "Cannot GET /" error
- Page not rendering

**Solutions:**

```bash
# Check if frontend is running
# Should be at http://localhost:5173

# Restart frontend
cd web
npm run dev

# Clear browser cache
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)

# Check console for errors
# Open browser DevTools (F12)
```

---

### 5. ❌ Protected Route Not Working

**Symptoms:**
- Can access `/admin/dashboard` without login
- Redirect not working

**Debug:**

```javascript
// Open browser console and check:
localStorage.getItem('token')  // Should return JWT token
localStorage.getItem('user')   // Should return user JSON

// If null, token is not saved
// Try login again

// Clear and re-login
localStorage.clear()
// Then login again
```

---

### 6. ❌ Logout Not Working

**Symptoms:**
- Still logged in after logout
- Can still access protected routes

**Solutions:**

```javascript
// Manual logout in browser console
localStorage.removeItem('token')
localStorage.removeItem('user')
location.href = '/login'

// Or clear all
localStorage.clear()
location.reload()
```

---

### 7. ❌ TypeScript Errors

**Symptoms:**
- Red squiggly lines in IDE
- Type errors

**Solutions:**

```bash
# Reinstall dependencies
cd web
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

### 8. ❌ Port Already in Use

**Symptoms:**
- "Port 3000 is already in use"
- "Port 5173 is already in use"

**Solutions:**

```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Windows - Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different ports
# Frontend:
npm run dev -- --port 5174

# Backend: Change in .env
PORT=3001
```

---

### 9. ❌ Module Not Found Errors

**Symptoms:**
- "Cannot find module 'react-router-dom'"
- "Cannot find module '@/components/...'"

**Solutions:**

```bash
# Install missing dependencies
cd web
npm install react-router-dom axios @radix-ui/react-label

# Check package.json
cat package.json | grep dependencies

# Reinstall all
rm -rf node_modules package-lock.json
npm install
```

---

### 10. ❌ Dark Mode Not Working

**Symptoms:**
- Can't switch themes
- Mode toggle not responding

**Solutions:**

```bash
# Check if theme provider is wrapping app
# File: web/src/main.tsx should have:
# <ThemeProvider>
#   <AppRouter />
# </ThemeProvider>

# Clear localStorage theme
localStorage.removeItem('theme')
location.reload()
```

---

## 🔍 Debug Checklist

Before asking for help, check:

- [ ] Backend is running on port 3000
- [ ] Frontend is running on port 5173
- [ ] .env file exists with correct API_URL
- [ ] Database is connected (check backend logs)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] localStorage has token after login
- [ ] CORS is enabled in backend

---

## 🆘 Still Having Issues?

### Check Backend Logs
```bash
cd HadirAPP
npm run start:dev
# Watch console for errors
```

### Check Frontend Console
1. Open browser (F12)
2. Go to Console tab
3. Look for red errors
4. Check Network tab for failed requests

### Test API Directly

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "role": "ADMIN"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123"
  }'
```

### Database Check

```bash
# If using Prisma, check database
cd HadirAPP
npx prisma studio
# Opens database GUI at http://localhost:5555
```

---

## 📞 Need More Help?

1. Check `AUTH_README.md` for detailed documentation
2. Check `VISUAL_GUIDE.md` for UI/flow diagrams
3. Review code comments in source files
4. Check backend API documentation at `http://localhost:3000/docs`
