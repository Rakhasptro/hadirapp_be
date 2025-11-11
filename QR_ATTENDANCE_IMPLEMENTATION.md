# QR-Based Attendance System - Implementation Guide

## 🎯 Overview

Sistem absensi berbasis QR Code untuk HadirAPP dengan workflow:
1. **Dosen** membuat jadwal kuliah → sistem generate QR code unik
2. **Mahasiswa** scan QR code dengan mobile app → upload foto selfie
3. **Dosen** validasi kehadiran (konfirmasi/tolak) berdasarkan foto selfie
4. **Dosen** export data kehadiran ke CSV/Excel

---

## 📁 File Structure

### Frontend (React + TypeScript + Vite)
```
web/src/
├── lib/
│   ├── api.ts                           # ✅ API service layer (scheduleService, attendanceService, teacherService)
│   ├── axios.ts                         # HTTP client with JWT interceptors
│   └── auth.ts                          # Authentication utilities
├── pages/
│   ├── teacher-dashboard.tsx            # ✅ Dashboard khusus dosen (stats + quick actions)
│   ├── schedules-list-page.tsx          # ✅ List semua jadwal dosen dengan search
│   ├── create-schedule-page.tsx         # ✅ Form create jadwal baru
│   ├── schedule-detail-page.tsx         # ✅ Detail jadwal + QR code + list kehadiran
│   └── pending-attendances-page.tsx     # ✅ List kehadiran pending validasi
├── components/
│   └── ui/
│       └── textarea.tsx                 # ✅ Textarea component (Radix UI)
├── router.tsx                           # ✅ Routing configuration
└── .env                                 # ✅ Environment variables
```

### Backend (NestJS + Prisma + MySQL)
```
hadir_be/                                # ⚠️ Hanya ada folder dist/ (compiled)
├── dist/                                # Compiled JavaScript files
├── uploads/
│   ├── photos/                          # Profile photos
│   └── selfies/                         # Attendance selfie images
└── (no src/ folder found)               # ⚠️ Source code not found
```

---

## 🚀 API Endpoints

### Authentication
```
POST   /api/auth/login              # Login (email, password)
POST   /api/auth/register           # Register new user
GET    /api/auth/profile            # Get current user profile
```

### Schedules (Protected - Teacher only)
```
POST   /api/schedules               # Create schedule + generate QR
GET    /api/schedules               # Get all schedules for logged-in teacher
GET    /api/schedules/:id           # Get schedule detail by ID
PATCH  /api/schedules/:id           # Update schedule
DELETE /api/schedules/:id           # Delete schedule
PATCH  /api/schedules/:id/complete  # Mark schedule as completed
```

### Attendance
```
# Public (no auth required)
GET    /api/public/schedules/verify/:qrCode  # Verify QR code validity

# Protected - Student
POST   /api/attendance/submit        # Submit attendance (multipart: selfie image)

# Protected - Teacher
GET    /api/attendance/pending       # Get all pending attendances
GET    /api/attendance/schedule/:scheduleId  # Get attendances for specific schedule
PATCH  /api/attendance/:id/confirm   # Confirm attendance
PATCH  /api/attendance/:id/reject    # Reject attendance (with reason)
GET    /api/attendance/statistics    # Get attendance statistics
GET    /api/attendance/export/csv/:scheduleId   # Export to CSV
GET    /api/attendance/export/excel/:scheduleId # Export to Excel
```

### Teacher
```
GET    /api/teachers/profile         # Get teacher profile
PATCH  /api/teachers/profile         # Update teacher profile
GET    /api/teachers/dashboard       # Get dashboard statistics
```

---

## 🎨 Pages Breakdown

### 1. Teacher Dashboard (`teacher-dashboard.tsx`)
**Route:** `/teacher/dashboard`

**Features:**
- 4 stat cards: Total Jadwal, Jadwal Hari Ini, Total Kehadiran, Perlu Validasi
- 3 quick action cards:
  - Buat Jadwal Baru → navigate to `/schedules/create`
  - Lihat Semua Jadwal → navigate to `/schedules`
  - Validasi Kehadiran → navigate to `/attendance/pending`
- Preview 5 pending attendances with quick confirm button
- All data from `teacherService.getDashboardStats()` and `attendanceService.getPendingAttendances()`

**API Calls:**
```typescript
const [dashboardStats, pendingList] = await Promise.all([
  teacherService.getDashboardStats(),      // { totalSchedules, todaySchedules, totalAttendances, pendingAttendances }
  attendanceService.getPendingAttendances() // Attendance[]
]);
```

---

### 2. Schedules List (`schedules-list-page.tsx`)
**Route:** `/schedules`

**Features:**
- Search bar (filter by courseName, courseCode, topic)
- Grid layout with cards showing:
  - Course name & code
  - Date & time range
  - Room location
  - Status badge (ACTIVE/COMPLETED/CANCELLED)
- Click card → navigate to detail page

**API Call:**
```typescript
const schedules = await scheduleService.getMySchedules(); // Schedule[]
```

---

### 3. Create Schedule (`create-schedule-page.tsx`)
**Route:** `/schedules/create`

**Features:**
- Form inputs: courseName, courseCode, date, startTime, endTime, room, topic
- Form validation (required fields)
- Submit → backend generates QR code → redirect to detail page
- Cancel button → navigate back to list

**API Call:**
```typescript
const newSchedule = await scheduleService.createSchedule({
  courseName, courseCode, date, startTime, endTime, room, topic
}); // Returns Schedule with qrCode and qrCodeImage (base64 PNG)
```

**Success Flow:**
```
Submit → API creates schedule + generates QR → Redirect to /schedules/:id
```

---

### 4. Schedule Detail (`schedule-detail-page.tsx`)
**Route:** `/schedules/:id`

**Features:**
- **QR Code Section:**
  - Display QR code image (from `schedule.qrCodeImage` - base64 PNG)
  - Download QR button → save as PNG file
  - QR token display (for manual entry)
  
- **Statistics Cards:**
  - Total Kehadiran (count attendances)
  - Pending (status=PENDING)
  - Confirmed (status=CONFIRMED)
  - Rejected (status=REJECTED)

- **Attendance List:**
  - Table showing: selfie thumbnail, name, NPM, scan time, status badge
  - For PENDING: Konfirmasi & Tolak buttons
  - For CONFIRMED: green checkmark badge
  - For REJECTED: red x badge with rejection reason
  - Click selfie → open modal with full-size image

- **Export Button:**
  - Export to CSV → download attendance data

**API Calls:**
```typescript
const schedule = await scheduleService.getScheduleById(id);
const attendances = await attendanceService.getScheduleAttendances(id);

// Actions
await attendanceService.confirmAttendance(attendanceId);
await attendanceService.rejectAttendance(attendanceId, reason);
const csvBlob = await attendanceService.exportToCSV(scheduleId);
attendanceService.downloadFile(csvBlob, `attendance-${schedule.courseCode}.csv`);
```

---

### 5. Pending Attendances (`pending-attendances-page.tsx`)
**Route:** `/attendance/pending`

**Features:**
- Search bar (filter by studentName, studentNpm, courseName)
- Date filter dropdown: All/Today/This Week
- List of pending attendances with:
  - Selfie image (clickable for full-size modal)
  - Student name & NPM
  - Course name & code
  - Scan date & time
  - Status badge (PENDING - yellow)
  - Action buttons: Konfirmasi, Tolak, Lihat Jadwal
- Empty state: "Semua Sudah Tervalidasi!" with checkmark icon

**API Calls:**
```typescript
const attendances = await attendanceService.getPendingAttendances();
await attendanceService.confirmAttendance(id);
await attendanceService.rejectAttendance(id, reason);
```

---

## 🔒 Authentication Flow

### JWT Storage
```typescript
// Login → save token
localStorage.setItem('token', response.data.accessToken);
localStorage.setItem('user', JSON.stringify(response.data.user));

// Axios interceptor adds token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Protected Routes
```typescript
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
  <Route path="/schedules" element={<SchedulesListPage />} />
  {/* ... */}
</Route>
```

---

## 📊 TypeScript Interfaces

### Schedule
```typescript
interface Schedule {
  id: string;
  teacherId: string;
  courseName: string;
  courseCode: string;
  date: string;              // ISO date string
  startTime: string;         // "HH:mm" format
  endTime: string;
  room: string;
  topic: string;
  qrCode: string;            // Unique token
  qrCodeImage: string;       // Base64 PNG image
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  teacher?: {
    id: string;
    name: string;
    nip: string;
  };
}
```

### Attendance
```typescript
interface Attendance {
  id: string;
  scheduleId: string;
  studentName: string;
  studentNpm: string;
  selfieImage: string;       // Path: uploads/selfies/filename.jpg
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  scannedAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  schedule?: Schedule;
}
```

---

## 🎯 User Flow

### Teacher Flow (Web Dashboard)
```
1. Login → /teacher/dashboard
2. Click "Buat Jadwal Baru" → /schedules/create
3. Fill form (courseName, date, time, etc.) → Submit
4. Redirect to /schedules/:id → See QR code
5. Download/Show QR code to students (in class or online)
6. Students scan QR → upload selfie → data appears in "Perlu Validasi"
7. Teacher clicks "Validasi Kehadiran" → /attendance/pending
8. Review selfie → Click "Konfirmasi" or "Tolak"
9. Export attendance data → CSV file downloaded
```

### Student Flow (Mobile App - not implemented yet)
```
1. Login to mobile app
2. Scan QR code (from teacher's screen)
3. Take selfie photo
4. Submit attendance
5. Wait for teacher confirmation
6. Get notification (confirmed/rejected)
```

---

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
# Frontend
cd web
npm install

# Backend (if hadir_be has package.json)
cd ../hadir_be
npm install
```

### 2. Configure Environment
```bash
# web/.env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Backend
```bash
cd hadir_be
npm run start:dev
# or if using compiled version:
node dist/main.js
```

### 4. Start Frontend
```bash
cd web
npm run dev
# Open http://localhost:5173
```

### 5. Test Flow
1. Login as teacher (email/password from database)
2. Navigate to `/teacher/dashboard`
3. Create new schedule → verify QR code generated
4. (Optional) Use Postman to simulate student attendance submission
5. Confirm/reject attendance from web dashboard
6. Export attendance data

---

## 🔍 Testing with Postman

### Submit Attendance (Simulate Student)
```http
POST http://localhost:3000/api/attendance/submit
Content-Type: multipart/form-data

{
  "scheduleId": "uuid-of-schedule",
  "studentName": "John Doe",
  "studentNpm": "1234567890",
  "selfie": [file upload]
}
```

### Verify QR Code
```http
GET http://localhost:3000/api/public/schedules/verify/{qrCode}
```

---

## ⚠️ Known Issues

1. **Backend Source Missing**: Only `hadir_be/dist/` folder found, no `src/` directory
   - ✅ Frontend implementation complete
   - ⚠️ Backend endpoints assumed based on API contracts
   - 🔧 Need to verify actual backend implementation

2. **Old vs New Routes**:
   - Old routes moved to `/old-schedules/*` for backwards compatibility
   - New QR-based routes: `/schedules/*`
   - Teacher dashboard: `/teacher/dashboard` (new) or `/dashboard` (unified)

3. **Image Paths**:
   - Selfie images served from: `{BASE_URL}/uploads/selfies/filename.jpg`
   - Make sure backend serves static files from `uploads/` directory
   - Frontend uses `VITE_API_URL.replace('/api', '')` to construct image URLs

---

## 📝 Next Steps

### Immediate (Before Testing)
- [ ] Verify backend is running and accessible at `http://localhost:3000`
- [ ] Test login endpoint with existing teacher credentials
- [ ] Verify JWT token is returned and stored correctly
- [ ] Test `/api/schedules` endpoint (create schedule)
- [ ] Verify QR code image generation works

### Testing Phase
- [ ] Test complete teacher flow (create → view → validate)
- [ ] Test attendance submission with Postman (multipart upload)
- [ ] Verify selfie images are uploaded to `uploads/selfies/`
- [ ] Test confirm/reject attendance actions
- [ ] Test CSV export functionality
- [ ] Test search/filter features

### Mobile App Integration (Future)
- [ ] Build React Native or Flutter mobile app
- [ ] Implement QR scanner (camera permission)
- [ ] Implement selfie capture (camera permission)
- [ ] Integrate with same backend API
- [ ] Add push notifications for attendance status

---

## 🎉 Summary

**Files Created/Modified:**
1. ✅ `web/src/lib/api.ts` - Complete API service layer
2. ✅ `web/src/pages/teacher-dashboard.tsx` - Teacher dashboard
3. ✅ `web/src/pages/schedules-list-page.tsx` - Schedules list
4. ✅ `web/src/pages/create-schedule-page.tsx` - Create schedule form
5. ✅ `web/src/pages/schedule-detail-page.tsx` - Schedule detail + QR + attendances
6. ✅ `web/src/pages/pending-attendances-page.tsx` - Pending validations
7. ✅ `web/src/components/ui/textarea.tsx` - Textarea component
8. ✅ `web/src/router.tsx` - Updated routes
9. ✅ `web/.env` - Environment configuration

**Total Lines of Code:** ~1,500+ lines

**Status:** Frontend implementation **COMPLETE** ✅  
**Next:** Backend testing and integration verification 🧪
