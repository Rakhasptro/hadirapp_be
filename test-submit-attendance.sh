#!/bin/bash

# HadirApp - Test Attendance Submission
# Usage: ./test-submit-attendance.sh <SCHEDULE_ID>

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"

if [ -z "$1" ]; then
  echo -e "${RED}Error: Schedule ID required${NC}"
  echo "Usage: ./test-submit-attendance.sh b4af0134-1e6e-47e4-a183-6a061ba64060"
  echo ""
  echo "Example:"
  echo "  ./test-submit-attendance.sh abc123-def456-ghi789"
  exit 1
fi

SCHEDULE_ID=$1

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   HadirApp - Test Attendance Submit   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Schedule ID: ${YELLOW}$SCHEDULE_ID${NC}"
echo ""

# Create dummy selfie image if not exists
if [ ! -f "test-selfie.jpg" ]; then
  echo -e "${YELLOW}Creating dummy selfie image...${NC}"
  # Create 1x1 pixel red image (minimal valid JPEG)
  echo -e "\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00\x43\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\x09\x09\x08\x0a\x0c\x14\x0d\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c\x20\x24\x2e\x27\x20\x22\x2c\x23\x1c\x1c\x28\x37\x29\x2c\x30\x31\x34\x34\x34\x1f\x27\x39\x3d\x38\x32\x3c\x2e\x33\x34\x32\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x7f\xff\xd9" > test-selfie.jpg
  echo -e "${GREEN}✓ Dummy image created${NC}\n"
fi

# Test data
students=(
  "Budi Santoso:2021001"
  "Siti Rahayu:2021002"
  "Ahmad Fauzi:2021003"
  "Dewi Lestari:2021004"
  "Eko Prasetyo:2021005"
)

success_count=0
error_count=0

echo -e "${BLUE}Starting attendance submissions...${NC}\n"

for student_data in "${students[@]}"; do
  IFS=':' read -r name npm <<< "$student_data"
  
  echo -e "${YELLOW}Submitting:${NC} $name (NPM: $npm)"
  
  response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/attendance/submit" \
    -F "scheduleId=$SCHEDULE_ID" \
    -F "studentName=$name" \
    -F "studentNpm=$npm" \
    -F "selfie=@test-selfie.jpg")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Success${NC} (HTTP $http_code)"
    success_count=$((success_count + 1))
  else
    echo -e "${RED}✗ Failed${NC} (HTTP $http_code)"
    echo -e "${RED}Response: $body${NC}"
    error_count=$((error_count + 1))
  fi
  echo ""
  
  # Small delay to avoid rate limiting
  sleep 0.5
done

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Test Summary                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "Total: ${YELLOW}${#students[@]}${NC} submissions"
echo -e "Success: ${GREEN}$success_count${NC}"
echo -e "Failed: ${RED}$error_count${NC}"
echo ""

if [ $success_count -eq ${#students[@]} ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo "1. Open frontend: http://localhost:5174/attendance/pending"
  echo "2. View pending attendances (should show $success_count items)"
  echo "3. Confirm/reject attendances"
  echo "4. Check schedule detail for attendance list"
else
  echo -e "${YELLOW}⚠ Some tests failed. Check errors above.${NC}"
fi

echo ""
