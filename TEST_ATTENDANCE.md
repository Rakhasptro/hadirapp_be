# Test Attendance System - HadirApp

## Prerequisites
- ✅ Backend running: `http://localhost:3000`
- ✅ Frontend running: `http://localhost:5174`
- ✅ User terdaftar: `teacher@test.com` / `password123`

---

## 🧪 Test Flow

### 1. Login (Frontend)
1. Buka: `http://localhost:5174/login`
2. Login dengan:
   - Email: `teacher@test.com`
   - Password: `password123`
3. ✅ Harus redirect ke `/teacher/dashboard`

---

### 2. Create Schedule (Frontend)
1. Klik **"Create Schedule"** atau navigasi ke `/schedules/create`
2. Isi form:
   ```
   Course Name: Pemrograman Mobile
   Course Code: IF-401
   Date: 2025-11-13 (pilih tanggal besok)
   Start Time: 08:00
   End Time: 10:00
   Room: Lab Komputer 1
   Topic: Introduction to Kotlin
   ```
3. Submit
4. ✅ Schedule berhasil dibuat (status: SCHEDULED)
5. **COPY SCHEDULE ID** dari URL (contoh: `/schedules/abc123-def456-...`)

---

### 3. Activate QR Code (Frontend)
1. Buka schedule detail (klik schedule yang baru dibuat)
2. Klik tombol **"Activate QR"** (hijau)
3. ✅ Status berubah dari SCHEDULED → ACTIVE
4. ✅ QR Code muncul di halaman
5. **SCREENSHOT QR CODE** (untuk test scan nanti)

---

### 4. Submit Attendance (via curl/Postman)

**Karena belum ada mobile app, kita simulasi submit via API:**

#### Test 1: Submit dengan Selfie Upload

**Prepare:**
1. Siapkan foto dummy: Download gambar test atau gunakan foto apapun
2. Save sebagai `test-selfie.jpg`

**Execute:**

```bash
# Ganti SCHEDULE_ID dengan ID dari step 2
SCHEDULE_ID="PASTE_YOUR_SCHEDULE_ID_HERE"

# Submit attendance mahasiswa 1
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Budi Santoso" \
  -F "studentNpm=2021001" \
  -F "selfie=@test-selfie.jpg"

# Submit attendance mahasiswa 2
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Siti Rahayu" \
  -F "studentNpm=2021002" \
  -F "selfie=@test-selfie.jpg"

# Submit attendance mahasiswa 3
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Ahmad Fauzi" \
  -F "studentNpm=2021003" \
  -F "selfie=@test-selfie.jpg"
```

**Expected Response:**
```json
{
  "message": "Attendance submitted successfully",
  "attendance": {
    "id": "att_xyz123...",
    "status": "PENDING",
    "studentName": "Budi Santoso",
    "studentNpm": "2021001",
    "scannedAt": "2025-11-12T10:30:00.000Z"
  }
}
```

---

### 5. View Pending Attendances (Frontend)
1. Klik menu **"Validate Attendance"** atau navigasi ke `/attendance/pending`
2. ✅ Harus muncul 3 attendance pending:
   - Budi Santoso (2021001)
   - Siti Rahayu (2021002)
   - Ahmad Fauzi (2021003)
3. Klik foto selfie → Modal muncul
4. ✅ Foto selfie terlihat dengan benar

---

### 6. Confirm Attendance (Frontend)
1. Di halaman pending attendances
2. Klik tombol **"Confirm"** (hijau) untuk Budi Santoso
3. ✅ Status berubah dari PENDING → CONFIRMED
4. ✅ Attendance hilang dari list pending
5. ✅ Toast notification: "Attendance confirmed"

---

### 7. Reject Attendance (Frontend)
1. Di halaman pending attendances
2. Klik tombol **"Reject"** (merah) untuk Ahmad Fauzi
3. Muncul dialog input reason
4. Isi reason: "Foto tidak jelas"
5. Submit
6. ✅ Status berubah dari PENDING → REJECTED
7. ✅ Attendance hilang dari list pending
8. ✅ Toast notification: "Attendance rejected"

---

### 8. View Schedule Detail (Frontend)
1. Navigasi ke schedule detail (`/schedules/{scheduleId}`)
2. Scroll ke section **"Attendances"**
3. ✅ Harus muncul:
   - ✅ Budi Santoso - CONFIRMED (hijau)
   - 🟡 Siti Rahayu - PENDING (kuning)
   - ❌ Ahmad Fauzi - REJECTED (merah) + reason
4. ✅ Counter attendance: "2/3 confirmed"

---

### 9. Export Attendance (Frontend)
1. Di schedule detail page
2. Klik tombol **"Export CSV"** atau **"Export Excel"**
3. ✅ File downloaded
4. ✅ File berisi:
   - Student Name, NPM, Status, Scanned At, Confirmed At

---

### 10. Test Duplicate Attendance (via curl)

**Test constraint: 1 mahasiswa hanya bisa absen 1x per schedule**

```bash
# Try to submit again with same NPM
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Budi Santoso" \
  -F "studentNpm=2021001" \
  -F "selfie=@test-selfie.jpg"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "Student already submitted attendance for this schedule"
}
```

---

### 11. Test QR Inactive (via curl)

**Test absen saat QR tidak aktif:**

1. Di frontend, klik tombol **"Deactivate QR"** (merah)
2. Status berubah ke SCHEDULED
3. Try submit attendance:

```bash
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=New Student" \
  -F "studentNpm=2021999" \
  -F "selfie=@test-selfie.jpg"
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": "QR Code is not active. Cannot submit attendance."
}
```

---

## ✅ Checklist Test

- [ ] Login berhasil
- [ ] Create schedule berhasil
- [ ] Activate QR berhasil
- [ ] Submit attendance 3 mahasiswa berhasil
- [ ] View pending attendances (3 items)
- [ ] Confirm 1 attendance berhasil
- [ ] Reject 1 attendance berhasil
- [ ] View attendance di schedule detail
- [ ] Export CSV/Excel berhasil
- [ ] Duplicate attendance ditolak
- [ ] Submit saat QR inactive ditolak
- [ ] Deactivate QR berhasil
- [ ] Close schedule berhasil

---

## 📝 Notes

### Upload Selfie
- Format: JPG, JPEG, PNG
- Max size: 5MB
- Disimpan di: `hadir_be/uploads/selfies/`

### Status Flow
```
SCHEDULED (default) 
    ↓ (Teacher activate)
ACTIVE (QR aktif, mahasiswa bisa scan)
    ↓ (Teacher deactivate atau close)
CLOSED (sesi selesai)
```

### Attendance Status
```
PENDING (mahasiswa submit, tunggu confirm)
    ↓ (Teacher action)
CONFIRMED (hadir) atau REJECTED (tidak hadir)
```

---

## 🐛 Common Issues

### Error: "Selfie image is required"
- Pastikan upload file dengan key `selfie`
- Format: multipart/form-data

### Error: "Schedule not found"
- Pastikan scheduleId benar
- Copy dari URL schedule detail

### Error: "Teacher ID not found"
- Login expired, login ulang
- Token JWT tidak valid

### Error: "QR Code is not active"
- Pastikan schedule status = ACTIVE
- Klik "Activate QR" di frontend

---

## 🚀 Next Steps

Setelah test berhasil:
1. ✅ Test dengan mobile app (Kotlin)
2. ✅ Test dengan real QR code scanner
3. ✅ Test dengan real camera selfie
4. ✅ Test pagination untuk banyak attendance
5. ✅ Test export dengan banyak data
