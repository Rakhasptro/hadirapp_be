# Fitur Jadwal Pelajaran - Admin

## 📋 Deskripsi
Fitur jadwal memungkinkan admin untuk mengelola jadwal pelajaran sekolah secara lengkap dengan validasi konflik jadwal otomatis.

## ✨ Fitur Utama

### 1. Daftar Jadwal
- Menampilkan semua jadwal yang dikelompokkan berdasarkan hari
- Filter berdasarkan:
  - Pencarian (mata pelajaran, guru, kelas)
  - Hari (Senin-Minggu)
  - Kelas
- Statistik ringkasan:
  - Total jadwal
  - Jumlah mata pelajaran
  - Jumlah kelas
- Tampilan card per hari dengan informasi:
  - Waktu (jam mulai - jam selesai)
  - Mata pelajaran
  - Kelas dan jurusan
  - Guru pengajar
  - Ruangan (jika ada)
  - WiFi network (jika ada)
  - Status aktif/nonaktif
- Aksi: Edit dan Hapus jadwal

### 2. Tambah Jadwal
- Form input dengan field:
  - Mata Pelajaran (required) - dropdown dari courses
  - Kelas (required) - dropdown dari classes
  - Guru Pengajar (required) - dropdown dari teachers
  - Hari (required) - Senin sampai Minggu
  - Waktu Mulai (required) - time picker
  - Waktu Selesai (required) - time picker
  - Ruangan (optional)
  - Jaringan WiFi (optional) - dropdown dari wifi_networks
  - Status Aktif - checkbox

### 3. Edit Jadwal
- Form yang sama dengan tambah jadwal
- Pre-filled dengan data jadwal yang dipilih
- Validasi konflik jadwal saat update

### 4. Validasi
- **Field Wajib**: Semua field required harus diisi
- **Validasi Waktu**: Waktu mulai harus lebih awal dari waktu selesai
- **Konflik Jadwal**: Sistem otomatis cek konflik untuk:
  - Guru yang sama tidak boleh mengajar di waktu yang sama
  - Kelas yang sama tidak boleh ada jadwal di waktu yang sama
- **Foreign Key**: Validasi courseId, classId, teacherId harus valid
- **Penghapusan**: Tidak bisa hapus jadwal yang sudah punya riwayat kehadiran

## 🔧 API Endpoints

### Admin Schedule Management
```
GET    /api/admin/schedules              - List semua jadwal dengan filter
GET    /api/admin/schedules/:id          - Detail jadwal
POST   /api/admin/schedules              - Buat jadwal baru
PUT    /api/admin/schedules/:id          - Update jadwal
DELETE /api/admin/schedules/:id          - Hapus jadwal
```

### Helper Endpoints
```
GET    /api/admin/teachers/list          - List guru untuk dropdown
GET    /api/admin/classes/list           - List kelas untuk dropdown
GET    /api/admin/courses/list           - List mata pelajaran untuk dropdown
GET    /api/admin/wifi/list              - List WiFi networks untuk dropdown
```

## 📊 Database Schema

### Table: schedules
```prisma
model schedules {
  id                  String                @id
  courseId            String
  classId             String
  teacherId           String
  dayOfWeek           schedules_dayOfWeek   // ENUM
  startTime           String                // Format: "HH:mm"
  endTime             String                // Format: "HH:mm"
  room                String?
  wifiNetworkId       String?
  isActive            Boolean               @default(true)
  createdAt           DateTime              @default(now())
  updatedAt           DateTime
  
  // Relations
  attendance_sessions attendance_sessions[]
  classes             classes               @relation(...)
  courses             courses               @relation(...)
  teachers            teachers              @relation(...)
  wifi_networks       wifi_networks?        @relation(...)
}
```

### Enum: schedules_dayOfWeek
```
MONDAY
TUESDAY
WEDNESDAY
THURSDAY
FRIDAY
SATURDAY
SUNDAY
```

## 🎨 UI Components

### Pages
- **SchedulesPage** (`/schedules`) - Daftar jadwal dengan filter
- **ScheduleFormPage** (`/schedules/create` dan `/schedules/edit/:id`) - Form tambah/edit

### Components Used
- Card, CardHeader, CardTitle, CardDescription, CardContent
- Button, Input, Badge
- Icons: Calendar, Clock, MapPin, Users, BookOpen, Filter, Search, Edit, Trash2, Wifi, Plus

## 🔒 Authorization
- Semua endpoint membutuhkan JWT token
- Hanya role **ADMIN** yang dapat mengakses
- Guard: `JwtAuthGuard` dan `RolesGuard` dengan `@Roles('ADMIN')`

## 🚀 Cara Penggunaan

### 1. Akses Menu Jadwal
- Login sebagai Admin
- Klik menu "Jadwal" di sidebar

### 2. Melihat Jadwal
- Jadwal ditampilkan per hari (Senin-Minggu)
- Gunakan filter untuk pencarian spesifik
- Lihat statistik di bagian atas

### 3. Menambah Jadwal Baru
- Klik tombol "Tambah Jadwal"
- Isi semua field yang required
- Sistem akan validasi konflik otomatis
- Klik "Simpan Jadwal"

### 4. Mengedit Jadwal
- Klik tombol "Edit" pada jadwal yang ingin diubah
- Ubah informasi yang diperlukan
- Klik "Perbarui Jadwal"

### 5. Menghapus Jadwal
- Klik tombol "Hapus" pada jadwal
- Konfirmasi penghapusan
- Jadwal akan dihapus jika tidak ada riwayat kehadiran

## 📝 Catatan Penting

1. **Konflik Jadwal**: Sistem akan menolak pembuatan/update jadwal jika:
   - Guru sudah mengajar di waktu yang sama
   - Kelas sudah ada jadwal di waktu yang sama

2. **Penghapusan**: Jadwal yang sudah punya riwayat kehadiran tidak bisa dihapus, hanya bisa dinonaktifkan dengan uncheck "Jadwal Aktif"

3. **Format Waktu**: Gunakan format 24 jam (HH:mm), contoh: 08:00, 13:30

4. **WiFi Network**: Optional, untuk integrasi dengan fitur kehadiran berbasis lokasi

## 🎯 Manfaat

- ✅ Pengelolaan jadwal terpusat
- ✅ Validasi konflik otomatis
- ✅ Filter dan pencarian yang fleksibel
- ✅ UI yang intuitif dan responsif
- ✅ Integrasi dengan sistem kehadiran
- ✅ Tracking aktivitas (createdAt, updatedAt)
