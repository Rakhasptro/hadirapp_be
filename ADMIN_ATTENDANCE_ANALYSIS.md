# 📊 Analisis Fitur Kehadiran (Attendance) untuk ADMIN

## 🎯 Overview

Berdasarkan analisis backend, berikut adalah **kemampuan ADMIN** dalam mengelola sistem kehadiran.

---

## 📋 Apa yang Bisa Dilakukan ADMIN?

### **1. VIEW (Melihat Data)**

| Fitur | Endpoint | Deskripsi |
|-------|----------|-----------|
| **Lihat Semua Sesi** | `GET /attendance/session/:id` | Melihat detail sesi absensi tertentu |
| **Laporan Kehadiran** | `GET /admin/attendance` | Melihat laporan kehadiran (filter by class) |
| **Statistik Hari Ini** | `GET /admin/attendance/today-stats` | Stats kehadiran hari ini (Present, Late, Absent) |
| **Chart Mingguan** | `GET /admin/attendance/chart/weekly` | Data chart kehadiran 7 hari terakhir |
| **Chart Bulanan** | `GET /admin/attendance/chart/monthly` | Data chart kehadiran per bulan |

### **2. MANAGE (Mengelola Sesi)**

| Fitur | Endpoint | Deskripsi |
|-------|----------|-----------|
| **Tutup Sesi** | `POST /attendance/session/:id/close` | Menutup sesi absensi yang masih aktif |
| **Monitor Sesi Aktif** | Via `/schedules/active` | Melihat sesi yang sedang berlangsung |

### **3. REPORT (Laporan & Analitik)**

| Fitur | Kemampuan |
|-------|-----------|
| **Filter by Class** | Lihat kehadiran per kelas |
| **Filter by Date Range** | Analisis kehadiran dalam periode tertentu |
| **Export Data** | (Future) Export ke Excel/PDF |
| **Statistik Global** | Total Present, Late, Absent, Attendance Rate |

---

## 🚫 Apa yang TIDAK Bisa Dilakukan ADMIN?

| Fitur | Alasan |
|-------|--------|
| **Buka Sesi Absensi** | Hanya TEACHER yang bisa (karena terkait jadwal mengajar) |
| **Input Kehadiran Manual** | Belum ada endpoint untuk manual input |
| **Edit Status Kehadiran** | Belum ada endpoint untuk edit attendance |
| **Delete Kehadiran** | Belum ada endpoint untuk delete |
| **Bulk Import** | Belum ada fitur bulk upload |

---

## 📊 Data Structure

### **Attendance Session**
```typescript
{
  id: string
  scheduleId: string
  teacherId: string
  date: Date
  startTime: Date
  endTime: Date | null    // null = masih aktif
  status: 'OPEN' | 'CLOSED'
  description: string
  topic: string
  notes: string | null
  qrCode: string | null
  qrExpiredAt: Date | null
  isActive: boolean
}
```

### **Attendance Record**
```typescript
{
  id: string
  studentId: string
  sessionId: string
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  checkInTime: Date
  checkOutTime: Date | null
  notes: string | null
  latitude: number | null
  longitude: number | null
  deviceInfo: string | null
}
```

---

## 🎯 Fitur yang Harus Dibuat untuk ADMIN

### **A. VIEW/READ Features**

#### **1. Dashboard Kehadiran**
- ✅ Total sesi hari ini
- ✅ Total kehadiran (Present, Late, Absent)
- ✅ Attendance rate percentage
- ✅ Chart mingguan/bulanan

#### **2. Daftar Semua Sesi**
- 📋 List semua sesi absensi (dengan filter)
- 🔍 Filter by:
  - Date range
  - Class
  - Teacher
  - Status (OPEN/CLOSED)
- 📊 Show:
  - Schedule info (course, class, time)
  - Teacher name
  - Total students
  - Present/Late/Absent count
  - Session status

#### **3. Detail Sesi**
- 👁️ View detail sesi absensi
- 📋 Daftar siswa yang hadir
- ⏰ Waktu check-in setiap siswa
- 📊 Summary statistics
- 📝 Session notes/description

#### **4. Laporan Kehadiran**
- 📊 Report per kelas
- 📅 Report per tanggal
- 👤 Report per siswa
- 🎯 Attendance rate per kelas

---

### **B. MANAGE Features (Future)**

#### **1. Manual Input Kehadiran**
```typescript
POST /admin/attendance/manual
Body: {
  sessionId: string
  studentId: string
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  notes?: string
}
```
**Use Case:** Admin bisa input kehadiran manual jika ada kesalahan atau siswa lupa absen

#### **2. Edit Kehadiran**
```typescript
PUT /admin/attendance/:id
Body: {
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  notes?: string
}
```
**Use Case:** Admin bisa koreksi status kehadiran jika ada kesalahan

#### **3. Delete Kehadiran**
```typescript
DELETE /admin/attendance/:id
```
**Use Case:** Hapus record kehadiran yang salah

#### **4. Bulk Operations**
```typescript
POST /admin/attendance/bulk
Body: {
  sessionId: string
  students: [
    { studentId: string, status: string }
  ]
}
```
**Use Case:** Input kehadiran massal untuk satu sesi

---

### **C. REPORT Features (Future)**

#### **1. Export to Excel**
```typescript
GET /admin/attendance/export/excel?classId=xxx&startDate=xxx&endDate=xxx
```

#### **2. Export to PDF**
```typescript
GET /admin/attendance/export/pdf?sessionId=xxx
```

#### **3. Send Report Email**
```typescript
POST /admin/attendance/send-report
Body: {
  email: string
  reportType: 'daily' | 'weekly' | 'monthly'
  classId?: string
}
```

---

## 🎨 UI Components yang Dibutuhkan

### **1. Attendance Dashboard** (Main Page)
```
┌─────────────────────────────────────────────────────┐
│  📊 Statistik Kehadiran Hari Ini                    │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ Hadir    │ Terlambat│ Tidak    │ Rate     │    │
│  │ 450      │ 23       │ 12       │ 95.2%    │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
├─────────────────────────────────────────────────────┤
│  📈 Chart Kehadiran (Weekly/Monthly)                │
│  [Bar Chart or Line Chart Component]                │
├─────────────────────────────────────────────────────┤
│  📋 Sesi Absensi Aktif                              │
│  [Active Sessions Table]                            │
└─────────────────────────────────────────────────────┘
```

### **2. Session List Page**
```
┌─────────────────────────────────────────────────────┐
│  🔍 Filter:  [Date] [Class] [Teacher] [Status]     │
├─────────────────────────────────────────────────────┤
│  📋 Daftar Sesi Absensi                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ Matematika - Kelas 10A - Pak Budi            │ │
│  │ 📅 5 Nov 2025, 08:00-09:30                    │ │
│  │ ✅ Hadir: 35  ⏰ Terlambat: 2  ❌ Tidak: 1    │ │
│  │ Status: OPEN        [View Details] [Close]   │ │
│  └───────────────────────────────────────────────┘ │
│  [... more sessions ...]                            │
└─────────────────────────────────────────────────────┘
```

### **3. Session Detail Page**
```
┌─────────────────────────────────────────────────────┐
│  📚 Matematika - Kelas 10A                          │
│  👨‍🏫 Guru: Pak Budi                                  │
│  📅 Tanggal: 5 Nov 2025                             │
│  ⏰ Waktu: 08:00 - 09:30                            │
│  📝 Topik: Pertemuan 5 Nov 2025                     │
├─────────────────────────────────────────────────────┤
│  📊 Summary                                         │
│  Total Siswa: 38                                    │
│  ✅ Hadir: 35 (92.1%)                               │
│  ⏰ Terlambat: 2 (5.3%)                             │
│  ❌ Tidak Hadir: 1 (2.6%)                           │
├─────────────────────────────────────────────────────┤
│  👥 Daftar Kehadiran                                │
│  ┌───────────────────────────────────────────────┐ │
│  │ 1. Ahmad Rizki      ✅ Hadir    08:02        │ │
│  │ 2. Budi Santoso     ✅ Hadir    08:05        │ │
│  │ 3. Citra Dewi       ⏰ Terlambat 08:15       │ │
│  │ 4. Dani Prabowo     ❌ Tidak Hadir  -        │ │
│  │ [... more students ...]                       │ │
│  └───────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  [Close Session] [Export PDF] [Export Excel]       │
└─────────────────────────────────────────────────────┘
```

### **4. Attendance Report Page**
```
┌─────────────────────────────────────────────────────┐
│  📊 Laporan Kehadiran                               │
│  🔍 Filter: [Kelas] [Tanggal Mulai] [Tanggal Akhir]│
├─────────────────────────────────────────────────────┤
│  📈 Statistik                                       │
│  Total Sesi: 45                                     │
│  Rata-rata Kehadiran: 92.5%                         │
│  Siswa Teraktif: Ahmad Rizki (100%)                 │
│  Siswa Perlu Perhatian: Dani (65%)                  │
├─────────────────────────────────────────────────────┤
│  📋 Detail per Kelas                                │
│  [Table with class-wise attendance data]            │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Access Control Matrix

| Feature | ADMIN | TEACHER | STUDENT |
|---------|-------|---------|---------|
| **View All Sessions** | ✅ | ✅ (own only) | ❌ |
| **View Session Detail** | ✅ | ✅ (own only) | ❌ |
| **Close Session** | ✅ | ✅ (own only) | ❌ |
| **View Reports** | ✅ All classes | ✅ Own classes | ✅ Own attendance |
| **Export Reports** | ✅ | ✅ (own classes) | ❌ |
| **Manual Input** | ✅ (future) | ✅ (future) | ❌ |
| **Edit Attendance** | ✅ (future) | ⚠️ (limited) | ❌ |
| **Delete Attendance** | ✅ (future) | ❌ | ❌ |
| **Create Session** | ❌ | ✅ | ❌ |
| **Mark Attendance** | ❌ | ❌ | ✅ |

---

## 🛠️ Implementation Priority

### **Phase 1: MVP (Minimal Viable Product)**
1. ✅ Dashboard with stats (already done)
2. ✅ Active sessions list (already done)
3. 🔨 **Session list page** (all sessions with filters)
4. 🔨 **Session detail page** (view attendance list)
5. 🔨 **Close session feature**

### **Phase 2: Reports**
6. 🔨 Attendance report by class
7. 🔨 Attendance report by date range
8. 🔨 Attendance report by student

### **Phase 3: Advanced Features**
9. Manual input attendance (admin override)
10. Edit attendance status
11. Bulk operations
12. Export to Excel/PDF
13. Email reports

---

## 📝 Endpoints yang Perlu Ditambahkan

### **1. Get All Sessions (with filters)**
```typescript
GET /admin/attendance/sessions
Query: {
  classId?: string
  teacherId?: string
  startDate?: string
  endDate?: string
  status?: 'OPEN' | 'CLOSED'
  page?: number
  limit?: number
}
```

### **2. Manual Input Attendance**
```typescript
POST /admin/attendance/manual
Body: {
  sessionId: string
  studentId: string
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  notes?: string
}
```

### **3. Edit Attendance**
```typescript
PUT /admin/attendance/:id
Body: {
  status: 'PRESENT' | 'LATE' | 'ABSENT'
  notes?: string
}
```

### **4. Get Attendance by Student**
```typescript
GET /admin/attendance/student/:studentId
Query: {
  startDate?: string
  endDate?: string
}
```

---

## ✅ Summary

### **ADMIN Dapat:**
1. ✅ **View** - Melihat semua data kehadiran (global)
2. ✅ **Monitor** - Monitor sesi aktif real-time
3. ✅ **Manage** - Tutup sesi yang masih terbuka
4. ✅ **Analyze** - Lihat statistik dan chart
5. ✅ **Report** - Generate laporan kehadiran
6. 🔨 **Override** - (Future) Input/edit manual jika perlu
7. 🔨 **Export** - (Future) Export data ke Excel/PDF

### **ADMIN TIDAK Dapat:**
- ❌ Buka sesi baru (hanya TEACHER)
- ❌ Input kehadiran sebagai siswa (hanya STUDENT)

### **Prioritas Implementasi:**
1. **HIGH**: Session list + detail + close session
2. **MEDIUM**: Reports by class/date/student
3. **LOW**: Manual input, edit, export features

---

**Next Step:** Implementasi UI untuk Session List & Detail Page 🚀
