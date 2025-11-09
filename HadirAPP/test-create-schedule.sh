#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NGVmYWE4MC1iZDIxLTRiZjQtOTk1Yy1hMTcwODNiZDAzMzIiLCJlbWFpbCI6InRlYWNoZXIxQHRlc3QuY29tIiwicm9sZSI6IlRFQUNIRVIiLCJ0ZWFjaGVySWQiOiI2NzA2NTEyMi00ZTM0LTQyNjAtODE1YS1hN2I4MTY0MDlmNGIiLCJpYXQiOjE3NjI2NTU5NDYsImV4cCI6MTc2Mjc0MjM0Nn0.ijbTxnFGH0jqnsUKHirW8zJreqhkHfQj5n6ZYqbhXTI"

echo "Creating schedule..."
/mingw64/bin/curl -v -X POST http://localhost:3000/api/schedules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseName":"Pemrograman Web","courseCode":"IF301","date":"2025-11-09","startTime":"08:00","endTime":"10:00","room":"Lab Komputer 1","topic":"Introduction to React"}'
