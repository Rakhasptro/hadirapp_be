# Frontend-Backend Integration Fix

## Problem Summary
Frontend mencoba mengakses endpoint lama (`/api/schedules/active`) yang tidak ada di backend QR-based baru.

## Root Cause
1. Folder `hadir_be` tidak memiliki source code (`package.json` dan `src/` missing)
2. Component frontend (`active-sessions.tsx`, `my-schedule.tsx`) masih menggunakan data model lama (WiFi-based system)

## Solution Applied

### 1. Backend - Restore Source Code
```bash
# Restore HadirAPP folder from git history
git checkout cab7cff -- HadirAPP/

# Copy essential files to hadir_be
cp -r HadirAPP/src hadir_be/
cp HadirAPP/package.json hadir_be/
cp HadirAPP/tsconfig.json hadir_be/
cp HadirAPP/tsconfig.build.json hadir_be/
cp HadirAPP/nest-cli.json hadir_be/
cp -r HadirAPP/prisma hadir_be/
cp HadirAPP/prisma.config.ts hadir_be/

# Install dependencies
cd hadir_be
npm install
npx prisma generate
npm run start:dev
```

**Result:** ✅ Backend now has complete source code and can run

---

### 2. Frontend - Update Components for QR-based System

#### File: `active-sessions.tsx`
**Changes:**
- ❌ Old: `axios.get('/schedules/active')` → WiFi-based model
- ✅ New: `scheduleService.getMySchedules()` → QR-based model
- Filter today's ACTIVE schedules only
- Display: courseName, courseCode, topic, room, time, status
- Click to navigate to schedule detail page

**Old Data Structure:**
```typescript
{
  className: string,
  subject: string,
  teacher: string,
  studentsPresent: number,
  totalStudents: number,
  dayOfWeek: string
}
```

**New Data Structure:**
```typescript
{
  courseName: string,
  courseCode: string,
  date: string,
  startTime: string,
  endTime: string,
  room: string,
  topic: string,
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
  qrCode: string,
  qrCodeImage: string
}
```

---

#### File: `my-schedule.tsx`
**Changes:**
- ❌ Old: `axios.get('/teachers/my-schedule')` → grouped by dayOfWeek
- ✅ New: `scheduleService.getMySchedules()` → sorted by date
- Filter upcoming schedules (today + future, ACTIVE only)
- Show next 5 schedules
- Display: courseName, courseCode, date, time, room

**Old Logic:**
- Group schedules by `dayOfWeek` (MONDAY, TUESDAY, etc.)
- Show all recurring weekly schedules

**New Logic:**
- Filter by `date >= today` AND `status === 'ACTIVE'`
- Sort by date ascending
- Show upcoming 5 schedules only

---

## API Endpoints Mapping

### Old System (WiFi-based)
```
GET /schedules/active        → Active sessions with WiFi
GET /teachers/my-schedule    → Weekly recurring schedule
```

### New System (QR-based)
```
GET /schedules               → All schedules for logged-in teacher
GET /schedules/:id           → Schedule detail with QR code
POST /schedules              → Create schedule + generate QR
GET /attendance/pending      → Pending attendance validations
```

---

## Testing Checklist

- [x] Backend starts successfully (`npm run start:dev`)
- [x] Backend has all source files
- [x] Prisma client generated
- [ ] Frontend loads dashboard without 404 errors
- [ ] `active-sessions` component shows today's schedules
- [ ] `my-schedule` component shows upcoming schedules
- [ ] Click schedule card navigates to detail page
- [ ] Login works and JWT token is saved

---

## Next Steps

1. **Test Backend Endpoints:**
   ```bash
   # Login
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"teacher@test.com","password":"password"}'
   
   # Get schedules (with Bearer token)
   curl -X GET http://localhost:3000/api/schedules \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Test Frontend:**
   - Open http://localhost:5173
   - Login as teacher
   - Check if dashboard loads without errors
   - Verify today's schedules appear
   - Click "Buat Jadwal" button → should navigate to create page

3. **Create Test Schedule:**
   - Fill form with course name, date, time, etc.
   - Submit → should generate QR code
   - Verify QR code is displayed on detail page

---

## Files Modified

```
✅ hadir_be/package.json                           - Restored from git
✅ hadir_be/src/                                   - Complete source code restored
✅ hadir_be/prisma/                                - Schema and migrations restored
✅ web/src/components/dashboard/active-sessions.tsx - Updated to QR-based API
✅ web/src/components/dashboard/my-schedule.tsx     - Updated to QR-based API
```

---

## Key Differences: Old vs New System

| Feature | Old (WiFi-based) | New (QR-based) |
|---------|------------------|----------------|
| **Attendance Method** | Auto by WiFi connection | Manual scan QR + selfie |
| **Schedule Type** | Weekly recurring | One-time date-based |
| **Data Model** | classes, courses, dayOfWeek | courseName, courseCode, date |
| **Teacher Action** | Monitor WiFi sessions | Create schedule → Show QR → Validate attendance |
| **Student Action** | Connect to WiFi | Scan QR → Take selfie → Submit |
| **Validation** | Automatic | Manual confirmation by teacher |

---

## Summary

**Problem:** Frontend trying to access `/api/schedules/active` (404 error) because backend didn't have that endpoint.

**Root Cause:** 
1. `hadir_be` folder incomplete (no package.json, no src/)
2. Frontend components using old WiFi-based API

**Solution:**
1. ✅ Restored backend source from git history
2. ✅ Updated frontend components to use new QR-based API
3. ✅ Changed data models and filtering logic
4. ✅ Updated UI to show QR-based schedule information

**Status:** Ready for testing! 🎉
