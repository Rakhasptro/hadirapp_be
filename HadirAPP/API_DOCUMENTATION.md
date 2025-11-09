# HadirApp Backend API Documentation

Base URL: `http://localhost:3000/api`

## 🔓 Public Endpoints (No Authentication Required)

### Verify QR Code
```http
GET /public/schedules/verify/:qrCode
```
**Purpose**: Mobile app scans QR code and verifies if schedule is valid for today.

**Response**:
```json
{
  "id": "d285cb4d-978e-4ddc-b259-0e0ec19e80b0",
  "courseName": "Pemrograman Web",
  "courseCode": "IF301",
  "date": "2025-11-09T00:00:00.000Z",
  "startTime": "08:00",
  "endTime": "10:00",
  "room": "Lab Komputer 1",
  "topic": "Introduction to React",
  "teacher": {
    "name": "teacher1",
    "nip": "NIP-38644"
  },
  "status": "ACTIVE"
}
```

### Submit Attendance (Student - No Auth)
```http
POST /attendance/submit
Content-Type: multipart/form-data
```

**Body** (Form Data):
- `selfie`: File (image, max 5MB, jpg/jpeg/png only)
- `scheduleId`: string (UUID from QR verification)
- `studentName`: string
- `studentNpm`: string

**Example using cURL**:
```bash
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "selfie=@/path/to/selfie.jpg" \
  -F "scheduleId=d285cb4d-978e-4ddc-b259-0e0ec19e80b0" \
  -F "studentName=John Doe" \
  -F "studentNpm=2021110001"
```

**Response**:
```json
{
  "message": "Attendance submitted successfully",
  "attendance": {
    "id": "attendance-uuid",
    "scheduleId": "schedule-uuid",
    "studentName": "John Doe",
    "studentNpm": "2021110001",
    "selfieImage": "selfie-1699123456789-abc123.jpg",
    "status": "PENDING",
    "submittedAt": "2025-11-09T08:15:00.000Z"
  }
}
```

---

## 🔐 Teacher Endpoints (Require JWT Authentication)

**Authentication Header**:
```
Authorization: Bearer <jwt_token>
```

### 1. Authentication

#### Register Teacher
```http
POST /auth/register
Content-Type: application/json
```
**Body**:
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

#### Login Teacher
```http
POST /auth/login
Content-Type: application/json
```
**Body**:
```json
{
  "email": "teacher@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login success",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "teacher@example.com",
    "role": "TEACHER",
    "profile": {
      "id": "teacher-uuid",
      "nip": "NIP-38644",
      "name": "teacher1"
    }
  }
}
```

### 2. Profile Management

#### Get Profile
```http
GET /profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "name": "Updated Name",
  "phone": "081234567890",
  "gender": "MALE"
}
```

### 3. Schedule Management

#### Create Schedule with QR Code
```http
POST /schedules
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "courseName": "Pemrograman Web",
  "courseCode": "IF301",
  "date": "2025-11-09",
  "startTime": "08:00",
  "endTime": "10:00",
  "room": "Lab Komputer 1",
  "topic": "Introduction to React"
}
```

**Response**:
```json
{
  "id": "schedule-uuid",
  "courseName": "Pemrograman Web",
  "courseCode": "IF301",
  "qrCode": "3b2e3bb4f31fe61739911e4f1bb0f7dc",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgo...",
  "status": "SCHEDULED"
}
```

#### Get All Teacher's Schedules
```http
GET /schedules
Authorization: Bearer <token>

# Optional query params:
?status=ACTIVE
?startDate=2025-11-01
?endDate=2025-11-30
```

#### Get Today's Schedules
```http
GET /schedules/today
Authorization: Bearer <token>
```

#### Update Schedule Status
```http
PATCH /schedules/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "status": "ACTIVE"  // SCHEDULED | ACTIVE | CLOSED
}
```

#### Update Schedule
```http
PUT /schedules/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Schedule
```http
DELETE /schedules/:id
Authorization: Bearer <token>
```

### 4. Attendance Management

#### Get Schedule's Attendances
```http
GET /attendance/schedule/:scheduleId
Authorization: Bearer <token>
```

#### Get Pending Attendances (Need Confirmation)
```http
GET /attendance/pending
Authorization: Bearer <token>
```

#### Confirm Attendance
```http
PATCH /attendance/:id/confirm
Authorization: Bearer <token>
```

#### Reject Attendance
```http
PATCH /attendance/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```
**Body**:
```json
{
  "reason": "Selfie tidak jelas / Bukan orang yang bersangkutan"
}
```

### 5. Teacher Dashboard

#### Get Dashboard Statistics
```http
GET /teachers/dashboard
Authorization: Bearer <token>
```

**Response**:
```json
{
  "teacherId": "teacher-uuid",
  "teacherName": "teacher1",
  "totalSchedules": 10,
  "todaySchedules": 2,
  "pendingAttendances": 5,
  "confirmedAttendances": 45
}
```

#### Get My Schedule
```http
GET /teachers/my-schedule
Authorization: Bearer <token>
```

#### Get My Classes
```http
GET /teachers/my-classes
Authorization: Bearer <token>
```

---

## 📱 Mobile App Workflow

### Student Attendance Flow:
1. **Scan QR Code** displayed by teacher
2. **Verify QR** via `GET /public/schedules/verify/:qrCode`
   - Check if schedule is valid for today
   - Check if status is ACTIVE
3. **Take Selfie** using camera
4. **Submit Attendance** via `POST /attendance/submit`
   - Upload selfie image
   - Include scheduleId from step 2
   - Input studentName and studentNpm manually
5. **Get Confirmation** - Attendance status is PENDING
6. **Wait for Teacher** to confirm/reject

### Teacher Web App Workflow:
1. **Login** via `POST /auth/login`
2. **Create Schedule** via `POST /schedules`
   - QR code automatically generated
3. **Display QR Code** on projector/screen (use qrCodeImage base64)
4. **Activate Schedule** via `PATCH /schedules/:id/status` (status: ACTIVE)
5. **Monitor Submissions** via `GET /attendance/pending`
6. **Confirm/Reject** attendances one by one
   - View selfie image
   - Verify student identity
   - Confirm via `PATCH /attendance/:id/confirm`

---

## 📁 File Storage

### Upload Directories:
- **Teacher Photos**: `uploads/teachers/`
- **Attendance Selfies**: `uploads/selfies/`

### Access Uploaded Files:
```
http://localhost:3000/uploads/selfies/selfie-1699123456789-abc123.jpg
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["Field is required"]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 409 Conflict (Duplicate Attendance)
```json
{
  "statusCode": 409,
  "message": "You have already submitted attendance for this schedule"
}
```

---

## 🔧 Environment Variables

```env
DATABASE_URL="mysql://user:password@localhost:3306/hadirapp"
JWT_SECRET="supersecretkey"
JWT_EXPIRES_IN="24h"
PORT=3000
```

---

## 🚀 Testing with cURL

### Complete Test Flow:
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher1@test.com","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 2. Create Schedule
SCHEDULE=$(curl -s -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseName":"Test","courseCode":"T01","date":"2025-11-09","startTime":"08:00","endTime":"10:00","room":"Lab 1","topic":"Test"}')

QR_CODE=$(echo $SCHEDULE | grep -o '"qrCode":"[^"]*"' | cut -d'"' -f4)
SCHEDULE_ID=$(echo $SCHEDULE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# 3. Verify QR (Public)
curl -X GET "http://localhost:3000/api/public/schedules/verify/$QR_CODE"

# 4. Activate Schedule
curl -X PATCH "http://localhost:3000/api/schedules/$SCHEDULE_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACTIVE"}'

# 5. Submit Attendance (with actual image file)
curl -X POST http://localhost:3000/api/attendance/submit \
  -F "selfie=@selfie.jpg" \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Test Student" \
  -F "studentNpm=2021110001"

# 6. Get Pending Attendances
curl -X GET http://localhost:3000/api/attendance/pending \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Additional Notes

1. **QR Code Validity**: QR codes are unique per schedule and validated only for today's date
2. **Selfie Upload**: Max 5MB, formats: jpg, jpeg, png
3. **Attendance Duplicate Prevention**: One student (identified by studentNpm) can only submit once per schedule
4. **Schedule Status Flow**: SCHEDULED → ACTIVE → CLOSED
5. **JWT Token Expiration**: Default 24 hours (configurable via JWT_EXPIRES_IN)

---

## 🎯 Next Development Steps

1. Implement email notifications for attendance confirmation
2. Add attendance reports/exports (CSV/PDF)
3. Add schedule recurrence (weekly classes)
4. Add student feedback/notes
5. Implement real-time updates using WebSockets
