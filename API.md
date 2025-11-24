# HadirApp - API Reference

This document lists the backend HTTP endpoints implemented in the repository (NestJS controllers).

Base URL: `http://{HOST}:{PORT}/api` (adjust according to your deployment). The controllers shown here map to paths below the API base.

> Note: Many endpoints require JWT authentication (see `JwtAuthGuard`) and role-based access (`RolesGuard`). When `Auth` is required the header is `Authorization: Bearer <token>`.

---

## Public

- GET `/`
  - Description: Health/info endpoint
  - Auth: none
  - Response: `{ message: 'HadirApp Backend is running 🚀' }`

---

## Auth

- POST `/auth/register`
  - Description: Register a new user
  - Body: `{ email: string, password: string, role?: string }`
  - Auth: none
  - Response: newly created user (depends on service)

- POST `/auth/login`
  - Description: Login and receive JWT
  - Body: `{ email: string, password: string }`
  - Auth: none
  - Response: `{ access_token: string, ... }`

---

## Upload

- POST `/upload/photo`
  - Description: Upload a photo file. Uses multipart/form-data field `photo`.
  - Body: file `photo`
  - Auth: none (controller does not require auth)
  - Response: `{ url, filename, size, mimetype }`

- POST `/attendance/submit` (file upload)
  - Description: Submit attendance with selfie image. Uses multipart/form-data field `selfie` and body fields.
  - Body (form-data): `selfie` (file), `scheduleId` (string), `studentName` (string), `studentNpm` (string)
  - Auth: none (public submission endpoint)
  - Response: created attendance object

---

## Attendance
Base path: `/attendance`

- GET `/attendance/schedule/:scheduleId`
  - Description: Get attendances for a schedule (teacher only)
  - Auth: JWT, Role `TEACHER`
  - Params: `scheduleId` (path)

- GET `/attendance/pending`
  - Description: List pending attendances for the authenticated teacher
  - Auth: JWT, Role `TEACHER`

- PATCH `/attendance/:id/confirm`
  - Description: Confirm a pending attendance (teacher)
  - Auth: JWT, Role `TEACHER`
  - Params: `id` (attendance id)

- PATCH `/attendance/:id/reject`
  - Description: Reject a pending attendance (teacher) with reason
  - Auth: JWT, Role `TEACHER`
  - Params: `id` (attendance id)
  - Body: `{ reason: string }`

---

## Schedules (Teacher)
Base path: `/schedules` (protected - teacher role)

- POST `/schedules`
  - Description: Create a schedule (teacher)
  - Auth: JWT, Role `TEACHER`
  - Body: schedule object (courseName, courseCode, date, startTime, endTime, room?, topic?, ...)

- GET `/schedules`
  - Description: List schedules for authenticated teacher (supports query)
  - Auth: JWT, Role `TEACHER`

- GET `/schedules/today`
  - Description: Get today's active schedules for teacher
  - Auth: JWT, Role `TEACHER`

- GET `/schedules/:id`
  - Description: Get schedule by id (public)
  - Auth: none

- PATCH `/schedules/:id/status`
  - Description: Update schedule status (ACTIVE / SCHEDULED / CLOSED) (teacher)
  - Auth: JWT, Role `TEACHER`
  - Body: `{ status: string }`

- PUT `/schedules/:id`
  - Description: Update schedule content (teacher)
  - Auth: JWT, Role `TEACHER`
  - Body: schedule patch object

- DELETE `/schedules/:id`
  - Description: Delete schedule (teacher)
  - Auth: JWT, Role `TEACHER`

---

## Public Schedules

- GET `/public/schedules/verify/:qrCode`
  - Description: Verify QR code for a schedule (used by mobile/web scanning)
  - Auth: none
  - Params: `qrCode`

---

## Student (Mobile)

- Intended Role: `STUDENT` (used by mobile apps)
  - Notes: Student accounts are primarily used by the mobile application to submit attendance and view schedule verification. The backend currently accepts attendance submissions via a public endpoint (no role required), but the `STUDENT` role is included in the schema for future authenticated flows.

- POST `/auth/register`
  - Description: Register a student account (optional when creating accounts via admin/teacher). Include `role: "STUDENT"` to create a student user.
  - Body example: `{ "email": "student@example.com", "password": "studentpass", "role": "STUDENT" }`
  - Auth: none

- POST `/auth/login`
  - Description: Login (returns JWT). Mobile apps should store the token and include `Authorization: Bearer <token>` for protected endpoints when implemented.

- POST `/attendance/submit`
  - Description: Submit attendance with selfie image. This endpoint is the main submission flow used by students (multipart/form-data: `selfie`, `scheduleId`, `studentName`, `studentNpm`).
  - Auth: none (public submission), but clients may later switch to authenticated submissions using `STUDENT` JWT.

- GET `/public/schedules/verify/:qrCode`
  - Description: Verify a scanned QR code for a schedule (students use this to validate which schedule the QR belongs to before submitting attendance).
  - Auth: none

---

---

## Teachers
Base path: `/teachers`

- GET `/teachers/dashboard`
  - Description: Teacher dashboard stats
  - Auth: JWT, Role `TEACHER`

- GET `/teachers/my-schedule`
  - Description: Teacher's own schedules
  - Auth: JWT, Role `TEACHER`

- GET `/teachers/my-classes`
  - Description: Classes assigned to teacher
  - Auth: JWT, Role `TEACHER`

- POST `/teachers`
  - Description: Create teacher (restricted/privileged)
  - Auth: check controller guards (may require `TEACHER` or privileged role)

- GET `/teachers`
  - Description: List teachers
  - Auth: none declared at method level

- GET `/teachers/:id`
  - Description: Get teacher by id
  - Auth: none declared at method level

- PATCH `/teachers/:id`
  - Description: Update teacher
  - Auth: none declared at method level

- DELETE `/teachers/:id`
  - Description: Remove teacher (returns 204 on success)
  - Auth: none declared at method level

---

## Users (Restricted)
Base path: `/users` (guarded by JWT + RolesGuard)

- GET `/users`
  - Description: Get all users
  - Auth: JWT, Role `TEACHER`

- GET `/users/:id`
  - Description: Get user by id
  - Auth: JWT, Role `TEACHER`

---

## Profile
Base path: `/profile` (JWT)

- GET `/profile`
  - Description: Get profile of authenticated user
  - Auth: JWT

- PUT `/profile`
  - Description: Update profile of authenticated user
  - Auth: JWT

---

## Notes & Next Steps
- This file is generated by scanning controller decorators. Some method-level guards, request/response DTOs and exact response shapes are defined in services and DTO files — consult `hadir_be/src/modules/*` for details on body schemas and validation.
- If you want, I can:
  - Expand this file with example request/response JSON for each endpoint (I can infer shapes from DTOs and services),
  - Generate a Postman collection or OpenAPI spec based on the code,
  - Create a smaller `API_OVERVIEW.md` or split per-module API files.
