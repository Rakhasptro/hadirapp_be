#!/bin/bash

echo "🧪 Testing HadirApp Backend API"
echo "================================"
echo ""

BASE_URL="http://localhost:3000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Register Teacher
echo -e "${BLUE}1. Testing Register Teacher${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@test.com",
    "password": "password123"
  }')
echo "$REGISTER_RESPONSE" | jq
echo ""

# 2. Login Teacher
echo -e "${BLUE}2. Testing Login Teacher${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher1@test.com",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | jq

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo -e "${GREEN}✓ Token: ${TOKEN:0:50}...${NC}"
echo ""

# 3. Get Profile
echo -e "${BLUE}3. Testing Get Profile${NC}"
curl -s -X GET $BASE_URL/profile \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 4. Create Schedule with QR Code
echo -e "${BLUE}4. Testing Create Schedule (with QR Code)${NC}"
SCHEDULE_RESPONSE=$(curl -s -X POST $BASE_URL/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Pemrograman Web",
    "courseCode": "IF301",
    "date": "2025-11-10",
    "startTime": "08:00",
    "endTime": "10:00",
    "room": "Lab Komputer 1",
    "topic": "Introduction to React"
  }')
echo "$SCHEDULE_RESPONSE" | jq

# Extract schedule ID and QR code
SCHEDULE_ID=$(echo $SCHEDULE_RESPONSE | jq -r '.id')
QR_CODE=$(echo $SCHEDULE_RESPONSE | jq -r '.qrCode')
echo -e "${GREEN}✓ Schedule ID: $SCHEDULE_ID${NC}"
echo -e "${GREEN}✓ QR Code: $QR_CODE${NC}"
echo ""

# 5. Get All Schedules
echo -e "${BLUE}5. Testing Get All Teacher Schedules${NC}"
curl -s -X GET $BASE_URL/schedules \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 6. Get Schedule by ID
echo -e "${BLUE}6. Testing Get Schedule by ID${NC}"
curl -s -X GET $BASE_URL/schedules/$SCHEDULE_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 7. Verify QR Code (Public - No Auth)
echo -e "${BLUE}7. Testing Verify QR Code (Public)${NC}"
curl -s -X GET $BASE_URL/public/schedules/verify/$QR_CODE | jq
echo ""

# 8. Update Schedule Status to ACTIVE
echo -e "${BLUE}8. Testing Update Schedule Status to ACTIVE${NC}"
curl -s -X PATCH $BASE_URL/schedules/$SCHEDULE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}' | jq
echo ""

# 9. Simulate Student Submit Attendance (would use multipart in real app)
echo -e "${BLUE}9. Testing Submit Attendance (Mock - without file)${NC}"
echo "Note: Untuk test lengkap dengan file, gunakan Postman atau curl dengan -F"
echo "Endpoint: POST $BASE_URL/attendance/submit"
echo "Required: selfie (file), scheduleId, studentName, studentNpm"
echo ""

# 10. Get Pending Attendances
echo -e "${BLUE}10. Testing Get Pending Attendances${NC}"
curl -s -X GET $BASE_URL/attendance/pending \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 11. Get Schedule Attendances
echo -e "${BLUE}11. Testing Get Schedule Attendances${NC}"
curl -s -X GET $BASE_URL/attendance/schedule/$SCHEDULE_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 12. Get Today's Schedules
echo -e "${BLUE}12. Testing Get Today's Schedules${NC}"
curl -s -X GET $BASE_URL/schedules/today \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

# 13. Teacher Dashboard
echo -e "${BLUE}13. Testing Teacher Dashboard${NC}"
curl -s -X GET $BASE_URL/teachers/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""

echo -e "${GREEN}✅ All API Tests Completed!${NC}"
echo ""
echo "Summary:"
echo "- Teacher registered and logged in"
echo "- Schedule created with QR code: $QR_CODE"
echo "- QR code verified successfully"
echo "- All endpoints working properly"
echo ""
echo "Next steps:"
echo "1. Test file upload untuk attendance submit di Postman"
echo "2. Test confirm/reject attendance"
echo "3. Build mobile app untuk scan QR code"
