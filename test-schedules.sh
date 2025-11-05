#!/bin/bash

# Script untuk test schedules endpoint
# Pastikan backend sudah running di http://localhost:3000

echo "========================================"
echo "🔍 TESTING SCHEDULES ENDPOINTS"
echo "========================================"
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Login untuk dapat token
echo -e "${YELLOW}Step 1: Login untuk mendapatkan token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login gagal! Pastikan sudah ada user admin di database${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login berhasil!${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Cek semua jadwal
echo -e "${YELLOW}Step 2: Mengecek SEMUA jadwal di database...${NC}"
ALL_SCHEDULES=$(curl -s -X GET http://localhost:3000/api/schedules/debug/all \
  -H "Authorization: Bearer $TOKEN")

echo "$ALL_SCHEDULES" | head -n 50
SCHEDULE_COUNT=$(echo $ALL_SCHEDULES | grep -o '"id"' | wc -l)
echo ""
echo -e "${GREEN}Total jadwal di database: $SCHEDULE_COUNT${NC}"
echo ""

# Step 3: Cek jadwal hari ini
echo -e "${YELLOW}Step 3: Mengecek jadwal HARI INI (WEDNESDAY)...${NC}"
TODAY_SCHEDULES=$(curl -s -X GET http://localhost:3000/api/schedules/debug/today \
  -H "Authorization: Bearer $TOKEN")

echo "$TODAY_SCHEDULES" | head -n 50
echo ""

# Step 4: Cek jadwal aktif sekarang
echo -e "${YELLOW}Step 4: Mengecek jadwal AKTIF SEKARANG...${NC}"
ACTIVE_SCHEDULES=$(curl -s -X GET http://localhost:3000/api/schedules/active \
  -H "Authorization: Bearer $TOKEN")

echo "$ACTIVE_SCHEDULES" | head -n 50
ACTIVE_COUNT=$(echo $ACTIVE_SCHEDULES | grep -o '"id"' | wc -l)
echo ""
echo -e "${GREEN}Total sesi aktif sekarang: $ACTIVE_COUNT${NC}"
echo ""

# Summary
echo "========================================"
echo "📊 SUMMARY"
echo "========================================"
echo "Total jadwal di database: $SCHEDULE_COUNT"
echo "Jadwal aktif sekarang: $ACTIVE_COUNT"
echo ""

if [ $SCHEDULE_COUNT -eq 0 ]; then
  echo -e "${RED}❌ TIDAK ADA JADWAL DI DATABASE!${NC}"
  echo "Solusi: Tambahkan jadwal dengan POST /api/schedules"
elif [ $ACTIVE_COUNT -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Ada jadwal di database, tapi tidak ada yang aktif sekarang${NC}"
  echo "Kemungkinan:"
  echo "  1. Tidak ada jadwal hari WEDNESDAY (Rabu)"
  echo "  2. Waktu sekarang di luar jam jadwal"
  echo "  3. isActive = false"
  echo ""
  echo "Lihat detail di response 'Step 3' di atas"
else
  echo -e "${GREEN}✅ Ada $ACTIVE_COUNT sesi aktif!${NC}"
fi

echo ""
echo "Selesai!"
