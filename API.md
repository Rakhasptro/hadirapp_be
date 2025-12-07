  # HadirApp - API Reference (mobile-focused)

Base URL: `http://{HOST}:{PORT}/api` (adjust according to your deployment).

This file focuses on the endpoints your mobile app will use (student flows) plus the teacher endpoints needed for dashboard/export. Many endpoints are protected by JWT (`Authorization: Bearer <token>`) and role checks (`RolesGuard`).

---

## Quick auth notes
- Register: `POST /auth/register` { email, password, role?: "STUDENT" | "TEACHER" }
- Login: `POST /auth/login` { email, password } → response contains `access_token` (JWT). The JWT payload includes `sub` (user id), `email`, `role`, and `teacherId` for teachers.

Store the `access_token` in the mobile app and send `Authorization: Bearer <token>` for protected endpoints.

---

## Upload (used by mobile or web)

- POST `/upload/photo`
  - multipart/form-data: field `photo` (file)
  - Auth: optional (controller currently public)
  - Response: `{ url: string, filename: string, size: number, mimetype: string }`
  - Use case: mobile can upload selfie first and send returned `url` when submitting attendance.

---

## Attendance (mobile + teacher)
Base path: `/attendance`

Endpoints mobile app should use

- GET `/attendance/session/:sessionId`
  - Purpose: validate a scanned QR token (or schedule id). Returns whether the session is active and schedule metadata.
  - Auth: none
  - Response example:
    {
      "valid": true,
      "schedule": { "id": "...", "courseName": "...", "qrCode": "...", "status":"ACTIVE", ... }
    }

- POST `/attendance/submit` (multipart)
  - Purpose: legacy web/file-upload flow. Use `selfie` file upload.
  - Body (form-data): `selfie` (file), `scheduleId`, `studentName`, `studentNpm`, optional `studentEmail`
  - Auth: none (public submission)
  - **Validation**: Schedule must have status `ACTIVE`. Returns 400 Bad Request if schedule is SCHEDULED or CLOSED.
  - Response: created attendance object or 400 error

- POST `/attendance/submit/mobile` (JSON) — recommended for mobile
  - Purpose: mobile-friendly JSON submission (base64 or remote URL)
  - Auth: recommended: JWT (Role STUDENT) — controller reads `req.user.email` and uses it as `studentEmail` when present
  - **Validation**: Schedule must have status `ACTIVE`. Returns 400 Bad Request if schedule is SCHEDULED or CLOSED.
  - Body JSON examples (two variants):
    1) using uploaded URL
    {
      "sessionId": "<session_token_or_schedule_id>",
      "studentId": "202219876319",
      "name": "Rafi",
      "imageUrl": "https://.../uploads/selfies/..jpg",
      "timestamp": "2025-11-26T08:05:00Z"
    }

    2) using base64 image
    {
      "sessionId": "<session_token_or_schedule_id>",
      "studentId": "202219876319",
      "name": "Rafi",
      "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
      "timestamp": "2025-11-26T08:05:00Z"
    }

  - Important: If JWT is present, backend will set `studentEmail` from `req.user.email`. If you prefer anonymous submit, include `email` in the body and backend will store it.

- GET `/attendance/history`
  - Purpose: return authenticated student's attendance history (their own records)
  - Auth: JWT required (Role STUDENT)
  - Behavior: when JWT contains `email`, the endpoint does an exact lookup by `studentEmail` to reliably return only the student's records. If email is not present it falls back to identifier matching by `studentNpm`/name.
  - Response: array of attendance objects with schedule details
    ```json
    [
      {
        "id": "...",
        "scheduleId": "...",
        "studentName": "Rakha adi saputro",
        "studentNpm": "202310715083",
        "studentEmail": "student@example.com",
        "selfieImage": "/uploads/selfies/...",
        "status": "CONFIRMED",
        "scannedAt": "2025-12-07T10:00:00Z",
        "schedule": {
          "id": "...",
          "courseName": "Keamanan Siber",
          "courseCode": "F5A8",
          "date": "2025-12-07",
          "startTime": "10:00",
          "endTime": "12:00",
          "room": "55-405",
          "status": "ACTIVE"
        }
      }
    ]
    ```

Teacher endpoints (dashboard)

- GET `/attendance/schedule/:scheduleId` (Role TEACHER)
  - Purpose: teacher list for a schedule

- PATCH `/attendance/:id/confirm` (Role TEACHER)
  - Purpose: confirm attendance

- PATCH `/attendance/:id/reject` (Role TEACHER) body: `{ reason: string }`
  - Purpose: reject attendance and store rejection reason

- GET `/attendance/export?session_id=<id>&type=csv` (Role TEACHER)
  - Purpose: export CSV of attendances for the session
  - Response: `text/csv` attachment. CSV columns: `attendance_id, student_npm, student_name, student_email, image_url, status, scanned_at, confirmed_by, confirmed_at`

---

## Schedules / QR flow (mobile)

- GET `/public/schedules/verify/:qrCode`
  - Purpose: mobile scans a QR -> call this endpoint to validate the QR and receive schedule info
  - Auth: none
  - Response: schedule object (id, courseName, date, startTime, endTime, status, qrCode)

Mobile recommended flow
1. Student scans QR -> extract `qrCode` token
2. Call `GET /attendance/session/:sessionId` (or public verify) to confirm session is ACTIVE
   - **Important**: Check `isActive: true` in response before showing attendance form
   - If `isActive: false`, display message "Absensi belum dibuka" or "Absensi sudah ditutup"
3. Capture selfie on device
4a. Upload selfie to `/upload/photo` (optional) → get `url` and then call `/attendance/submit/mobile` with `imageUrl`
4b. Or send `imageBase64` directly to `/attendance/submit/mobile`
5. Student receives success response. Teacher will see PENDING in their dashboard until confirmation.

---

## Users / Profile

- POST `/auth/register` (create student or teacher)
- POST `/auth/login` (get JWT)
- GET `/profile` (JWT) — get current user profile

## CSV export notes
- The export endpoint includes `student_email` column. If you want to include additional user fields (e.g., student user id) I can add them to the CSV.

---

## Testing checklist for mobile integration
- Register/login student → confirm JWT contains `email` claim
- Scan QR → call `GET /attendance/session/:sessionId` and verify `valid: true`
- Upload selfie to `/upload/photo` (optional) or prepare base64
- POST `/attendance/submit/mobile` with JWT; verify returned attendance and that `studentEmail` is set in DB
- GET `/attendance/history` with JWT; verify your submissions appear
- Ask teacher to confirm one attendance and verify status change and that history shows `CONFIRMED`

---

If you want, I can:
- Generate a Postman collection with these requests and example bodies for mobile testing.
- Add a small "backfill" script to populate `studentEmail` for older rows by matching `studentNpm` to users (useful if you already have user records with NPM/email).
- Add `studentEmail` into the frontend schedule detail UI and CSV export display if desired.

