    # 🎯 Unified Dashboard dengan Role-Based Content

## ✅ Implementasi Selesai!

Saya telah membuat **satu halaman dashboard** yang menampilkan **konten berbeda** berdasarkan role user (ADMIN atau TEACHER).

---

## 🔑 Konsep: Unified Dashboard dengan Dynamic Content

### **Sebelum:**
```
/admin/dashboard    → Dashboard khusus admin
/teacher/dashboard  → Dashboard khusus teacher
/student/dashboard  → Dashboard khusus student
```
❌ 3 halaman terpisah, duplicate code

### **Sekarang:**
```
/dashboard → Dashboard untuk semua role
           → Konten berubah otomatis berdasarkan role
```
✅ 1 halaman, konten dinamis, DRY principle

---

## 📊 Perubahan Backend (HadirAPP)

### **1. Teacher Controller** - Endpoint Baru

```typescript
// GET /teachers/dashboard
@Roles('TEACHER')
async getTeacherDashboard(@Request() req)
// Response:
{
  "teacherId": "uuid",
  "teacherName": "Pak Budi",
  "totalClasses": 3,
  "totalCourses": 2,
  "totalStudents": 95,
  "todaySessions": 2
}

// GET /teachers/my-schedule
@Roles('TEACHER')
async getMySchedule(@Request() req)
// Response: Array of schedules dengan course, class, wifi info

// GET /teachers/my-classes
@Roles('TEACHER')
async getMyClasses(@Request() req)
// Response: Array of classes yang diampu dengan student count
```

### **2. Teacher Service** - Method Baru

```typescript
- getTeacherDashboard(user) → Stats untuk teacher
- getMySchedule(user) → Jadwal mengajar
- getMyClasses(user) → Kelas yang diampu
```

---

## 🎨 Perubahan Frontend (web)

### **1. Komponen Baru untuk Teacher**

#### `TeacherStatsCards.tsx`
Statistik untuk teacher:
- **Kelas Diampu** - Jumlah kelas yang diajar
- **Mata Pelajaran** - Jumlah mata pelajaran
- **Total Siswa** - Siswa di semua kelas yang diampu
- **Sesi Hari Ini** - Sesi absensi yang dibuat hari ini

#### `MySchedule.tsx`
Jadwal mengajar teacher:
- Grouped by hari (Senin - Minggu)
- Sorted by waktu
- Menampilkan:
  - Mata pelajaran & kode
  - Kelas & grade
  - Waktu mulai & selesai
  - Ruangan (jika ada)
  - WiFi network (jika ada)

### **2. App.tsx - Dynamic Content**

```tsx
function App() {
  const user = authService.getUser()
  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  
  return (
    <>
      {/* Stats Cards - Different for each role */}
      {isAdmin && <StatsCards />}
      {isTeacher && <TeacherStatsCards />}
      
      {/* Content - Different layout */}
      {isAdmin && (
        <>
          <AttendanceChart />
          <AttendanceStats />
          <ActiveSessions />
          <RecentNotifications />
        </>
      )}
      
      {isTeacher && (
        <>
          <MySchedule />
          <ActiveSessions />
          <RecentNotifications />
        </>
      )}
    </>
  )
}
```

### **3. Router - Unified**

```tsx
// Semua role ke satu dashboard
<Route path="/dashboard" element={
  <ProtectedRoute>
    <App />
  </ProtectedRoute>
} />

// Legacy routes redirect ke unified dashboard
<Route path="/admin/dashboard" element={<Navigate to="/dashboard" />} />
<Route path="/teacher/dashboard" element={<Navigate to="/dashboard" />} />
```

---

## 🎯 Perbedaan Konten: ADMIN vs TEACHER

### **ADMIN Dashboard**

| Komponen | Keterangan |
|----------|------------|
| **StatsCards** | Total Siswa, Guru, Kelas, Admin (sistem-wide) |
| **AttendanceChart** | Grafik kehadiran global (mingguan/bulanan) |
| **AttendanceStats** | Statistik kehadiran hari ini (seluruh sekolah) |
| **ActiveSessions** | Semua sesi yang sedang berlangsung |
| **RecentNotifications** | Notifikasi sistem |

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Stats Cards (4 cards)                      │
├─────────────────────┬───────────────────────┤
│  AttendanceChart    │  AttendanceStats      │
│  (4 cols)           │  (3 cols)             │
├─────────────────────┼───────────────────────┤
│  ActiveSessions     │  RecentNotifications  │
└─────────────────────┴───────────────────────┘
```

---

### **TEACHER Dashboard**

| Komponen | Keterangan |
|----------|------------|
| **TeacherStatsCards** | Kelas Diampu, Mata Pelajaran, Total Siswa, Sesi Hari Ini |
| **MySchedule** | Jadwal mengajar (grouped by day) |
| **ActiveSessions** | Sesi yang sedang berlangsung |
| **RecentNotifications** | Notifikasi untuk teacher |

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Teacher Stats Cards (4 cards)              │
├─────────────────────┬───────────────────────┤
│  MySchedule         │  ActiveSessions       │
│  (4 cols)           │  (3 cols)             │
├─────────────────────┴───────────────────────┤
│  RecentNotifications (full width)           │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security & Access Control

### **Backend Protection**

```typescript
// Admin endpoints - tetap protected
@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  // Hanya ADMIN yang bisa akses
}

// Teacher endpoints - protected untuk TEACHER
@Controller('teachers')
export class TeachersController {
  @Get('dashboard')
  @Roles('TEACHER')
  async getTeacherDashboard() {
    // Hanya TEACHER yang bisa akses
  }
}
```

### **Frontend Protection**

```tsx
// ProtectedRoute - Cek authentication
<Route path="/dashboard" element={
  <ProtectedRoute>
    <App />  {/* Konten berubah berdasarkan role */}
  </ProtectedRoute>
} />

// Di App.tsx - Conditional rendering
{isAdmin && <AdminContent />}
{isTeacher && <TeacherContent />}
```

### **Data Isolation**

- **ADMIN**: Lihat data seluruh sistem
- **TEACHER**: Hanya lihat data kelas yang diampu
  - `getTeacherDashboard()` filter by `teacherId`
  - `getMySchedule()` filter by `teacherId`
  - `getMyClasses()` filter by `teacherId`

---

## 🚀 Cara Menggunakan

### **1. Jalankan Backend**
```bash
cd HadirAPP
npm run start:dev
```

### **2. Jalankan Frontend**
```bash
cd web
npm run dev
```

### **3. Test dengan User Berbeda**

#### Login sebagai ADMIN:
```
Email: admin@example.com
Password: password123
```
➡️ Dashboard menampilkan **overview sistem global**

#### Login sebagai TEACHER:
```
Email: teacher@example.com
Password: password123
```
➡️ Dashboard menampilkan **jadwal mengajar & kelas yang diampu**

---

## 📋 API Endpoints Summary

| Endpoint | Role | Method | Deskripsi |
|----------|------|--------|-----------|
| `/admin/stats` | ADMIN | GET | Statistik sistem global |
| `/admin/users` | ADMIN | GET | Semua users |
| `/admin/attendance/today-stats` | ADMIN | GET | Kehadiran hari ini (global) |
| `/admin/attendance/chart/weekly` | ADMIN | GET | Grafik mingguan (global) |
| `/admin/attendance/chart/monthly` | ADMIN | GET | Grafik bulanan (global) |
| `/teachers/dashboard` | TEACHER | GET | Statistik teacher |
| `/teachers/my-schedule` | TEACHER | GET | Jadwal mengajar |
| `/teachers/my-classes` | TEACHER | GET | Kelas yang diampu |
| `/schedules/active` | ALL | GET | Sesi aktif (filtered by role) |

---

## 🎨 Components Mapping

### **ADMIN Uses:**
- `StatsCards` (Total Siswa, Guru, Kelas, Admin)
- `AttendanceChart` (Grafik global)
- `AttendanceStats` (Stats global)
- `ActiveSessions` (Semua sesi)
- `RecentNotifications`

### **TEACHER Uses:**
- `TeacherStatsCards` (Stats personal)
- `MySchedule` (Jadwal mengajar)
- `ActiveSessions` (Sesi yang sedang berlangsung)
- `RecentNotifications`

### **STUDENT Uses:** (Future)
- `StudentStatsCards` (Kehadiran personal)
- `MyAttendance` (Riwayat kehadiran)
- `MySchedule` (Jadwal kelas)
- `LeaveRequests` (Izin/cuti)

---

## ✅ Keuntungan Unified Dashboard

### **1. Code Maintainability**
- ✅ Tidak ada duplicate code
- ✅ Single source of truth
- ✅ Easier to update

### **2. User Experience**
- ✅ Consistent navigation
- ✅ Seamless experience
- ✅ Same URL structure

### **3. Development Speed**
- ✅ Faster feature development
- ✅ Less testing needed
- ✅ Reusable components

### **4. Security**
- ✅ Centralized authentication
- ✅ Role-based content rendering
- ✅ Backend API protection

---

## 🔧 Troubleshooting

### **Issue: Teacher melihat konten Admin**
**Cause:** Role tidak terdeteksi dengan benar

**Solution:**
```bash
# Cek token di localStorage
localStorage.getItem('token')

# Decode JWT token untuk lihat role
# Atau check di browser console:
authService.getUser()
```

### **Issue: API 403 Forbidden**
**Cause:** Token expired atau role tidak sesuai

**Solution:**
```bash
# Logout dan login ulang
# Atau regenerate token di backend
```

### **Issue: Komponen tidak muncul**
**Cause:** Conditional rendering error

**Solution:**
```tsx
// Pastikan check role dengan benar
const isAdmin = user?.role === 'ADMIN'
const isTeacher = user?.role === 'TEACHER'

// Jangan lupa optional chaining
{isAdmin && <Component />}
```

---

## 📝 File yang Diubah

### **Backend:**
1. `src/modules/teachers/teachers.controller.ts` - Tambah 3 endpoint
2. `src/modules/teachers/teachers.service.ts` - Tambah 3 method

### **Frontend:**
1. `src/components/dashboard/teacher-stats-cards.tsx` - NEW
2. `src/components/dashboard/my-schedule.tsx` - NEW
3. `src/App.tsx` - Dynamic content rendering
4. `src/router.tsx` - Unified routing
5. `src/components/auth/protected-route.tsx` - Updated

---

## 🎯 Summary

✅ **1 Dashboard, Multiple Roles**
- ADMIN → Global system overview
- TEACHER → Personal teaching schedule
- Same URL: `/dashboard`

✅ **Dynamic Content**
- Stats cards berbeda
- Layout berbeda
- Data filtered by role

✅ **Secure**
- Backend API protected dengan `@Roles()`
- Frontend conditional rendering
- Data isolation per role

✅ **Scalable**
- Easy to add STUDENT view
- Reusable components
- Clean architecture

---

**Status:** ✅ **Production Ready**

Sekarang ADMIN dan TEACHER bisa akses dashboard yang sama di `/dashboard`, tapi melihat konten yang berbeda sesuai role mereka! 🚀
