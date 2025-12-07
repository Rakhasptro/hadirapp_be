#!/bin/bash

# Test Submit Attendance with Multipart Form Data
# Ganti SCHEDULE_ID dengan ID dari schedule yang sudah dibuat

SCHEDULE_ID="c7699d0d-ec36-4eee-873f-9a8639e0fd99"
API_URL="http://localhost:3000/api"

echo "=== Test Submit Attendance ==="
echo ""

# Buat dummy selfie image file (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/dummy_selfie.png

# Test 1: Submit attendance mahasiswa 1
echo "1. Submit attendance - Budi Santoso (NPM: 2021001)"
curl -X POST "$API_URL/attendance/submit" \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Budi Santoso" \
  -F "studentNpm=2021001" \
  -F "selfie=@/tmp/dummy_selfie.png"
echo -e "\n"

# Test 2: Submit attendance mahasiswa 2
echo "2. Submit attendance - Siti Rahayu (NPM: 2021002)"
curl -X POST "$API_URL/attendance/submit" \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Siti Rahayu" \
  -F "studentNpm=2021002" \
  -F "selfie=@/tmp/dummy_selfie.png"
echo -e "\n"

# Test 3: Submit attendance mahasiswa 3
echo "3. Submit attendance - Ahmad Fauzi (NPM: 2021003)"
curl -X POST "$API_URL/attendance/submit" \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Ahmad Fauzi" \
  -F "studentNpm=2021003" \
  -F "selfie=@/tmp/dummy_selfie.png"
echo -e "\n"

# Test 4: Submit attendance mahasiswa 4
echo "4. Submit attendance - Dewi Lestari (NPM: 2021004)"
curl -X POST "$API_URL/attendance/submit" \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Dewi Lestari" \
  -F "studentNpm=2021004" \
  -F "selfie=@/tmp/dummy_selfie.png"
echo -e "\n"

# Test 5: Submit attendance mahasiswa 5, then mark as izin sakit (reject with reason)
echo "5. Submit attendance - Riko Pratama (NPM: 2021005) -> mark as Izin Sakit"
response=$(curl -s -X POST "$API_URL/attendance/submit" \
  -F "scheduleId=$SCHEDULE_ID" \
  -F "studentName=Riko Pratama" \
  -F "studentNpm=2021005" \
  -F "selfie=@/tmp/dummy_selfie.png")

echo "Response: $response"

# Extract attendance id from response (look for first "id":"..." occurrence)
attendance_id=$(echo "$response" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)

if [ -n "$attendance_id" ]; then
  echo "Marking attendance $attendance_id as 'Izin sakit' (reject with reason)"
  curl -s -X PATCH "$API_URL/attendance/$attendance_id/reject" \
    -H "Content-Type: application/json" \
    -d '{"reason":"Izin sakit"}'
  echo -e "\n"
else
  echo "Could not extract attendance id from response; skipping reject step"
fi

# Cleanup
rm -f /tmp/dummy_selfie.png

echo "=== Test Complete ==="
echo ""
echo "Check pending attendances at:"
echo "- Frontend: http://localhost:5174/attendance/pending"
echo "- API: curl http://localhost:3000/api/attendance/pending -H 'Authorization: Bearer YOUR_TOKEN'"
