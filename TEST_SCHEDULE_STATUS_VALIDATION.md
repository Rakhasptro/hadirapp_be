# Test Validasi Status Schedule untuk Attendance

## Tujuan
Memastikan student tidak bisa submit attendance jika schedule belum diaktifkan (status bukan ACTIVE).

## Setup Test

### 1. Buat Schedule dengan Status SCHEDULED (belum aktif)
```bash
# Login sebagai teacher terlebih dahulu
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}' \
  | jq -r '.access_token'

# Simpan token di variable
TOKEN="<teacher_access_token_here>"

# Buat schedule baru (default status = SCHEDULED)
curl -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Test Keamanan Siber",
    "courseCode": "F5A8",
    "date": "2025-12-07",
    "startTime": "10:00",
    "endTime": "12:00",
    "room": "55-405",
    "topic": "Testing Status Validation"
  }'

# Catat SCHEDULE_ID dari response
```

### 2. Test: Coba Submit Attendance dengan Schedule SCHEDULED
```bash
SCHEDULE_ID="<schedule_id_from_above>"

# Buat dummy selfie
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_selfie.png

# Test 1: Submit via multipart form (web/mobile upload)
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Test Student" \
  -F "studentNpm=2025001" \
  -F "selfie=@/tmp/test_selfie.png"

# Expected Response:
# {
#   "statusCode": 400,
#   "message": "Attendance is not open yet. Schedule must be activated by teacher first.",
#   "error": "Bad Request"
# }

# Test 2: Submit via mobile JSON endpoint
# (Butuh student login token dulu jika endpoint di-guard)
curl -X POST http://localhost:3000/api/attendance/submit/mobile \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SCHEDULE_ID'",
    "studentId": "2025002",
    "name": "Mobile Test Student",
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'

# Expected Response: same 400 error
```

### 3. Test: Aktifkan Schedule dan Coba Lagi
```bash
# Aktifkan schedule
curl -X PATCH http://localhost:3000/api/schedules/$SCHEDULE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACTIVE"}'

# Sekarang coba submit attendance lagi (seharusnya berhasil)
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Test Student" \
  -F "studentNpm=2025001" \
  -F "selfie=@/tmp/test_selfie.png"

# Expected Response: 201 Created dengan attendance object
```

### 4. Test: Coba Submit setelah Schedule CLOSED
```bash
# Close schedule
curl -X PATCH http://localhost:3000/api/schedules/$SCHEDULE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"CLOSED"}'

# Coba submit lagi dengan NPM berbeda
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Late Student" \
  -F "studentNpm=2025003" \
  -F "selfie=@/tmp/test_selfie.png"

# Expected Response: 400 Bad Request (schedule not ACTIVE)
```

## Hasil yang Diharapkan

| Status Schedule | Student Submit | Expected Result |
|----------------|----------------|-----------------|
| SCHEDULED      | ❌ Ditolak     | 400 Bad Request |
| ACTIVE         | ✅ Berhasil    | 201 Created     |
| CLOSED         | ❌ Ditolak     | 400 Bad Request |

## Status Code yang Dikembalikan
- **400 Bad Request**: Schedule tidak aktif atau sudah ditutup
- **201 Created**: Attendance berhasil dibuat (hanya jika status = ACTIVE)
- **404 Not Found**: Schedule tidak ditemukan
- **409 Conflict**: Student sudah submit untuk schedule ini (duplicate)

## Clean Up
```bash
# Hapus dummy file
rm -f /tmp/test_selfie.png
```

## Catatan untuk Mobile App Developer
- Sebelum menampilkan form submit attendance, sebaiknya cek dulu status schedule via endpoint `GET /attendance/session/:sessionId`
- Response dari endpoint tersebut sudah include field `isActive` yang menunjukkan apakah schedule bisa diakses untuk attendance
- Tampilkan pesan yang jelas ke user jika schedule belum/sudah tidak aktif
