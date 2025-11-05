# 📊 Panduan Integrasi Dashboard Overview dengan Backend

## ✅ Perubahan yang Telah Dilakukan

### 1. **Backend API Endpoints** (HadirAPP)

#### ✨ Endpoint Baru di Admin Module

| Endpoint | Method | Deskripsi | Response |
|----------|--------|-----------|----------|
| `/admin/stats` | GET | Statistik dashboard utama | `{ totalStudents, totalTeachers, totalClasses, attendanceToday }` |
| `/admin/users` | GET | Daftar semua users | Array of users with students/teachers relation |
| `/admin/attendance/today-stats` | GET | Statistik kehadiran hari ini | `{ total, present, late, absent }` |
| `/admin/attendance/chart/weekly` | GET | Data grafik mingguan (7 hari) | Array of `{ date, present, late, absent }` |
| `/admin/attendance/chart/monthly` | GET | Data grafik bulanan (30 hari) | Array of `{ date, present, late, absent }` |

#### 📝 Contoh Response:

**GET /admin/stats**
```json
{
  "totalStudents": 1248,
  "totalTeachers": 87,
  "totalClasses": 42,
  "attendanceToday": 1089
}
```

**GET /admin/attendance/today-stats**
```json
{
  "total": 1248,
  "present": 1089,
  "late": 87,
  "absent": 72
}
```

**GET /admin/attendance/chart/weekly**
```json
[
  {
    "date": "29 Okt",
    "present": 950,
    "late": 65,
    "absent": 233
  },
  {
    "date": "30 Okt",
    "present": 1020,
    "late": 58,
    "absent": 170
  },
  ...
]
```

---

### 2. **Frontend Components** (web)

#### 📦 Komponen yang Diupdate:

##### a) **StatsCards.tsx**
- ✅ Fetch data dari `/admin/stats`
- ✅ Hitung jumlah admin dari `/admin/users`
- ✅ Auto-refresh setiap 30 detik
- ✅ Loading state dengan skeleton
- ✅ Format angka dengan `.toLocaleString()`

**Fitur:**
- Total Siswa (warna biru)
- Total Guru (warna hijau)
- Total Kelas (warna ungu)
- Total Admin (warna oranye)

##### b) **AttendanceStats.tsx**
- ✅ Fetch data dari `/admin/attendance/today-stats`
- ✅ Auto-refresh setiap 1 menit
- ✅ Hitung persentase kehadiran
- ✅ Badge dengan variant sesuai status (default/secondary/destructive)

**Statistik:**
- Hadir (hijau) - PRESENT
- Terlambat (kuning) - LATE
- Tidak Hadir (merah) - ABSENT/EXCUSED/SICK

##### c) **AttendanceChart.tsx**
- ✅ Toggle antara grafik Mingguan/Bulanan
- ✅ Fetch dari `/admin/attendance/chart/weekly` atau `/admin/attendance/chart/monthly`
- ✅ Loading state
- ✅ Empty state jika tidak ada data
- ✅ Responsive chart dengan Recharts

**Fitur:**
- Bar chart dengan 3 kategori (Hadir, Terlambat, Tidak Hadir)
- Tooltip interaktif
- Legend
- Auto-refresh saat ganti period

##### d) **ActiveSessions.tsx** (sudah diupdate sebelumnya)
- ✅ Fetch dari `/schedules/active`
- ✅ Auto-refresh setiap 1 menit
- ✅ Tampilkan ruangan, guru, persentase kehadiran

---

## 🚀 Cara Menggunakan

### 1. **Pastikan Backend Berjalan**
```bash
cd HadirAPP
npm run start:dev
```

Backend akan running di: http://localhost:3000

### 2. **Pastikan Frontend Berjalan**
```bash
cd web
npm run dev
```

Frontend akan running di: http://localhost:5173 (atau port lain jika sibuk)

### 3. **Login sebagai Admin**
1. Buka http://localhost:5173/login
2. Login dengan credentials admin
3. Dashboard akan otomatis load data dari backend

---

## 🎯 Flow Data

```
┌─────────────────┐
│   Dashboard     │
│   (Frontend)    │
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌────────────────────┐      ┌──────────────────────┐
│  StatsCards        │      │  AttendanceStats     │
│  GET /admin/stats  │      │  GET /admin/         │
│  GET /admin/users  │      │  attendance/         │
│                    │      │  today-stats         │
└────────────────────┘      └──────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌────────────────────┐      ┌──────────────────────┐
│ AttendanceChart    │      │  ActiveSessions      │
│ GET /admin/        │      │  GET /schedules/     │
│ attendance/chart/  │      │  active              │
│ weekly|monthly     │      │                      │
└────────────────────┘      └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       AdminService (Backend)         │
│  - getDashboardStats()               │
│  - getTodayAttendanceStats()         │
│  - getWeeklyAttendanceChart()        │
│  - getMonthlyAttendanceChart()       │
│  - getAllUsers()                     │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Prisma ORM → Database           │
│  - students table                    │
│  - teachers table                    │
│  - classes table                     │
│  - attendances table                 │
│  - users table                       │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### 1. **Data Tidak Muncul / Kosong**

**Kemungkinan Penyebab:**
- Database belum ada data
- Backend tidak running
- Endpoint error
- Authentication gagal

**Solusi:**
```bash
# Cek apakah backend running
curl http://localhost:3000/api

# Cek data di database dengan Prisma Studio
cd HadirAPP
npx prisma studio

# Cek console browser untuk error
F12 → Console tab
```

### 2. **"Failed to fetch" Error**

**Penyebab:** Backend tidak running atau URL salah

**Solusi:**
```bash
# Pastikan backend running
cd HadirAPP
npm run start:dev

# Cek .env di folder web
# VITE_API_URL=http://localhost:3000/api
```

### 3. **Data Tidak Update**

**Penyebab:** Auto-refresh interval belum jalan

**Solusi:**
- Refresh manual dengan F5
- Cek console untuk error
- Cek Network tab di browser DevTools

### 4. **Persentase Kehadiran Salah**

**Penyebab:** Perhitungan di backend

**Solusi:**
- Cek `getTodayAttendanceStats()` di `admin.service.ts`
- Pastikan status attendance benar (PRESENT, LATE, ABSENT)
- Verifikasi data di Prisma Studio

---

## 📝 Catatan Penting

### Auto-Refresh Intervals:
- **StatsCards**: 30 detik
- **AttendanceStats**: 1 menit
- **AttendanceChart**: Saat ganti period
- **ActiveSessions**: 1 menit

### Data Real-time:
Semua data di dashboard sekarang menggunakan **data real dari database**, tidak lagi menggunakan mock data.

### Guards & Authentication:
Semua endpoint admin dilindungi dengan:
- `JwtAuthGuard` - Memerlukan token valid
- `RolesGuard` - Hanya role ADMIN yang bisa akses
- `@Roles('ADMIN')` decorator

### Performance:
- Query dioptimalkan dengan Prisma
- Auto-refresh untuk data fresh
- Loading states untuk UX yang baik
- Error handling untuk reliability

---

## 🎨 Tampilan Dashboard

Komponen dashboard sekarang menampilkan:
1. ✅ **4 Cards Statistik Utama** (Siswa, Guru, Kelas, Admin)
2. ✅ **Statistik Kehadiran Hari Ini** (Hadir, Terlambat, Tidak Hadir)
3. ✅ **Grafik Kehadiran** (Mingguan/Bulanan dengan bar chart)
4. ✅ **Sesi Aktif** (Jadwal yang sedang berlangsung)

Semua dengan data REAL dari backend! 🚀

---

## 📚 File yang Diubah

### Backend (HadirAPP):
- `src/modules/admin/admin.service.ts` - Tambah 4 method baru
- `src/modules/admin/admin.controller.ts` - Tambah 3 endpoint baru
- `src/modules/schedules/schedules.service.ts` - Tambah logging & method baru
- `src/modules/schedules/schedules.controller.ts` - Tambah endpoint debugging

### Frontend (web):
- `src/components/dashboard/stats-cards.tsx` - Integrasi dengan API
- `src/components/dashboard/attendance-stats.tsx` - Integrasi dengan API
- `src/components/dashboard/attendance-chart.tsx` - Integrasi dengan API
- `src/components/dashboard/active-sessions.tsx` - Fix struktur data

---

## ✨ Next Steps (Opsional)

1. **Tambah Filter Tanggal** di grafik kehadiran
2. **Export Data** ke Excel/PDF
3. **Notifikasi Real-time** dengan WebSocket
4. **Dashboard untuk Teacher & Student** role
5. **Analytics Dashboard** lebih detail

Selamat! Dashboard overview Anda sekarang fully integrated dengan backend! 🎉
