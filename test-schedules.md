# Test Schedule Endpoints

## Cara Test dengan Browser atau Postman

### 1. Login dulu untuk dapat token
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Copy token dari response, lalu gunakan untuk request berikutnya dengan header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Endpoints untuk Debugging

### 1. Cek Semua Jadwal (tanpa filter)
```bash
GET http://localhost:3000/api/schedules/debug/all
Authorization: Bearer YOUR_TOKEN
```

**Tujuan**: Melihat SEMUA jadwal yang ada di database

---

### 2. Cek Jadwal Hari Ini (tanpa filter waktu)
```bash
GET http://localhost:3000/api/schedules/debug/today
Authorization: Bearer YOUR_TOKEN
```

**Tujuan**: Melihat jadwal yang sesuai dengan hari ini (Rabu, 5 Nov 2025)

---

### 3. Cek Jadwal Aktif Sekarang (dengan filter waktu)
```bash
GET http://localhost:3000/api/schedules/active
Authorization: Bearer YOUR_TOKEN
```

**Tujuan**: Melihat jadwal yang sedang berlangsung SAAT INI

---

## Kemungkinan Penyebab Response Kosong

### ✅ Cek 1: Apakah ada jadwal di database?
Test: `GET /schedules/debug/all`
- Jika kosong → **Belum ada data jadwal di database**
- Jika ada data → Lanjut ke cek 2

### ✅ Cek 2: Apakah ada jadwal hari ini (Rabu)?
Test: `GET /schedules/debug/today`
- Response akan menunjukkan:
  - `day: "WEDNESDAY"`
  - `currentTime: "14:21"` (waktu sekarang)
  - `count: X` (jumlah jadwal hari ini)
  - `schedules: [...]` (daftar jadwal)

### ✅ Cek 3: Apakah ada jadwal yang sedang berlangsung?
Test: `GET /schedules/active`
- Filter: 
  - `dayOfWeek = WEDNESDAY`
  - `startTime <= waktu sekarang`
  - `endTime > waktu sekarang`
  - `isActive = true`

---

## Solusi Jika Response Kosong

### Solusi 1: Tambah Data Jadwal
Buat jadwal baru dengan POST request:
```bash
POST http://localhost:3000/api/schedules
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "courseId": "course-uuid",
  "classId": "class-uuid",
  "teacherId": "teacher-uuid",
  "dayOfWeek": "WEDNESDAY",
  "startTime": "08:00",
  "endTime": "10:00",
  "room": "Lab 1",
  "wifiNetworkId": null
}
```

### Solusi 2: Ubah Filter Waktu
Jika ingin menampilkan semua jadwal hari ini (bukan hanya yang aktif), ubah komponen web untuk hit endpoint `/schedules/debug/today`

### Solusi 3: Buat Jadwal Test
Sesuaikan dengan waktu sekarang (14:21):
```json
{
  "dayOfWeek": "WEDNESDAY",
  "startTime": "14:00",
  "endTime": "16:00",
  ...
}
```

---

## Log yang Akan Muncul di Terminal

Saat hit endpoint `/schedules/active`, akan muncul log:
```
🔍 Debug Info:
Current Day: WEDNESDAY
Current Time: 14:21
Date: 2025-11-05T...
Found sessions: 0
```

Ini akan membantu debugging!
