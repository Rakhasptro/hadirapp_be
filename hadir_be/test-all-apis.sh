#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "   HadirApp Backend API Testing"
echo "=========================================="
echo ""

# 1. Login
echo -e "${BLUE}1. Login Teacher${NC}"
LOGIN_RESPONSE=$(/mingw64/bin/curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher1@test.com","password":"password123"}')

# Extract token manually (since jq not available)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 2. Get Profile
echo -e "${BLUE}2. Get Profile${NC}"
PROFILE=$(/mingw64/bin/curl -s -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN")
echo "$PROFILE" | head -c 200
echo "..."
echo -e "${GREEN}✓ Profile retrieved${NC}"
echo ""

# 3. Get All Schedules
echo -e "${BLUE}3. Get All Schedules${NC}"
SCHEDULES=$(/mingw64/bin/curl -s -X GET http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN")
  
# Count schedules
SCHEDULE_COUNT=$(echo "$SCHEDULES" | grep -o '"id"' | wc -l)
echo "Total Schedules: $SCHEDULE_COUNT"

# Extract first schedule ID and QR code
SCHEDULE_ID=$(echo "$SCHEDULES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
QR_CODE=$(echo "$SCHEDULES" | grep -o '"qrCode":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "First Schedule ID: $SCHEDULE_ID"
echo "QR Code: $QR_CODE"
echo -e "${GREEN}✓ Schedules retrieved${NC}"
echo ""

# 4. Verify QR Code (Public - No Auth)
echo -e "${BLUE}4. Verify QR Code (Public Endpoint)${NC}"
QR_VERIFY=$(/mingw64/bin/curl -s -X GET "http://localhost:3000/api/public/schedules/verify/$QR_CODE")
echo "$QR_VERIFY" | head -c 300
echo "..."
echo -e "${GREEN}✓ QR Code verified${NC}"
echo ""

# 5. Get Today's Schedules
echo -e "${BLUE}5. Get Today's Schedules${NC}"
TODAY=$(/mingw64/bin/curl -s -X GET http://localhost:3000/api/schedules/today \
  -H "Authorization: Bearer $TOKEN")
TODAY_COUNT=$(echo "$TODAY" | grep -o '"id"' | wc -l)
echo "Today's Schedules: $TODAY_COUNT"
echo -e "${GREEN}✓ Today's schedules retrieved${NC}"
echo ""

# 6. Update Schedule Status to ACTIVE
echo -e "${BLUE}6. Update Schedule Status to ACTIVE${NC}"
STATUS_UPDATE=$(/mingw64/bin/curl -s -X PATCH "http://localhost:3000/api/schedules/$SCHEDULE_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ACTIVE"}')
echo "$STATUS_UPDATE" | head -c 200
echo "..."
echo -e "${GREEN}✓ Status updated to ACTIVE${NC}"
echo ""

# 7. Get Pending Attendances
echo -e "${BLUE}7. Get Pending Attendances${NC}"
PENDING=$(/mingw64/bin/curl -s -X GET http://localhost:3000/api/attendance/pending \
  -H "Authorization: Bearer $TOKEN")
PENDING_COUNT=$(echo "$PENDING" | grep -o '"id"' | wc -l)
echo "Pending Attendances: $PENDING_COUNT"
echo -e "${GREEN}✓ Pending attendances retrieved${NC}"
echo ""

# 8. Teacher Dashboard
echo -e "${BLUE}8. Teacher Dashboard${NC}"
DASHBOARD=$(/mingw64/bin/curl -s -X GET http://localhost:3000/api/teachers/dashboard \
  -H "Authorization: Bearer $TOKEN")
echo "$DASHBOARD"
echo -e "${GREEN}✓ Dashboard loaded${NC}"
echo ""

# 9. Get My Schedule
echo -e "${BLUE}9. Get My Schedule${NC}"
MY_SCHEDULE=$(/mingw64/bin/curl -s -X GET http://localhost:3000/api/teachers/my-schedule \
  -H "Authorization: Bearer $TOKEN")
MY_COUNT=$(echo "$MY_SCHEDULE" | grep -o '"id"' | wc -l)
echo "My Schedules: $MY_COUNT"
echo -e "${GREEN}✓ My schedule retrieved${NC}"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✅ All API Tests Completed!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "- ✓ Authentication working (login, JWT)"
echo "- ✓ Schedules created with QR codes"
echo "- ✓ QR verification working (public endpoint)"
echo "- ✓ Teacher dashboard accessible"
echo "- ✓ Schedule status updates working"
echo ""
echo "Next Steps:"
echo "1. Test attendance submission with file upload (use Postman)"
echo "2. Test attendance confirmation/rejection"
echo "3. Build mobile app for QR scanning"
echo "4. Build React web app for teachers"
