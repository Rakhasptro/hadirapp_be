# 🧪 Quick Test - Attendance System

## Prerequisites
✅ Backend running on `http://localhost:3000`  
✅ Frontend running on `http://localhost:5174`  
✅ Logged in as: `teacher@test.com` / `password123`

---

## 📝 Test Steps

### 1. Create Schedule (Frontend)
1. Open: `http://localhost:5174/schedules/create`
2. Fill form:
   - Course Name: **Pemrograman Mobile**
   - Course Code: **IF-401**
   - Date: **2025-11-13**
   - Start Time: **08:00**
   - End Time: **10:00**
   - Room: **Lab Komputer 1**
3. Submit
4. **Copy Schedule ID** from URL

---

### 2. Activate QR Code (Frontend)
1. Open schedule detail
2. Click **"Activate QR"** button
3. Status changes: SCHEDULED → ACTIVE
4. QR Code appears

---

### 3. Submit Attendance (Script)

**Option A: Auto submit 5 students**
```bash
./test-submit-attendance.sh YOUR_SCHEDULE_ID
```

**Option B: Manual submit 1 student**
```bash
./quick-test-attendance.sh YOUR_SCHEDULE_ID
```

**Option C: Via curl directly**
```bash
# Create dummy image first
echo -e "\xff\xd8\xff\xe0..." > selfie.jpg

curl -X POST http://localhost:3000/api/attendance/submit \
  -F "scheduleId=YOUR_SCHEDULE_ID" \
  -F "studentName=Budi Santoso" \
  -F "studentNpm=2021001" \
  -F "selfie=@selfie.jpg"
```

---

### 4. View Pending Attendances (Frontend)
1. Open: `http://localhost:5174/attendance/pending`
2. Should see submitted attendances
3. Click selfie image to preview
4. Click **Confirm** (green) or **Reject** (red)

---

### 5. View in Schedule Detail (Frontend)
1. Open: `http://localhost:5174/schedules/YOUR_SCHEDULE_ID`
2. Scroll to **Attendances** section
3. See list of attendances with status:
   - 🟢 CONFIRMED
   - 🟡 PENDING
   - 🔴 REJECTED

---

## ✅ Expected Results

After running test script:
- ✅ 5 attendances created with PENDING status
- ✅ Selfie images saved in `hadir_be/uploads/selfies/`
- ✅ Can view in pending page
- ✅ Can confirm/reject
- ✅ Status updates in real-time

---

## 🐛 Troubleshooting

**Error: "Selfie image is required"**
→ Make sure file upload with key `selfie`

**Error: "Schedule not found"**
→ Check Schedule ID is correct

**Error: "QR Code is not active"**
→ Activate QR first in frontend

**Error: "Student already submitted"**
→ Each student can only submit once per schedule

---

## 📂 Files

- `test-submit-attendance.sh` - Auto submit 5 students
- `quick-test-attendance.sh` - Quick test 1 student
- `TEST_ATTENDANCE.md` - Full test documentation
