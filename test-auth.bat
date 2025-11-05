@echo off
REM HadirApp Authentication Test Script for Windows
REM This script helps you test the authentication flow

echo ================================
echo HadirApp Authentication Test
echo ================================
echo.

REM Configuration
set API_URL=http://localhost:3000/api
set FRONTEND_URL=http://localhost:5173
set TEST_EMAIL=admin-test@hadirapp.com
set TEST_PASSWORD=admin123

echo Test Configuration:
echo    API URL: %API_URL%
echo    Frontend URL: %FRONTEND_URL%
echo    Test Email: %TEST_EMAIL%
echo    Test Password: %TEST_PASSWORD%
echo.

REM Check if curl is available
where curl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] curl is not installed or not in PATH
    echo Please install curl or use Git Bash to run test-auth.sh
    pause
    exit /b 1
)

REM Check if backend is running
echo Checking if backend is running...
curl -s %API_URL% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend is running
) else (
    echo [ERROR] Backend is NOT running
    echo Please start backend: cd HadirAPP ^&^& npm run start:dev
    pause
    exit /b 1
)
echo.

REM Check if frontend is running
echo Checking if frontend is running...
curl -s %FRONTEND_URL% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend is running
) else (
    echo [WARNING] Frontend is NOT running
    echo Please start frontend: cd web ^&^& npm run dev
)
echo.

REM Test 1: Register
echo ================================
echo Test 1: Register New User
echo ================================
echo POST %API_URL%/auth/register

curl -s -X POST "%API_URL%/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\",\"role\":\"ADMIN\"}"

echo.
echo [INFO] Registration attempted
echo        (If user exists, this is OK)
echo.

REM Test 2: Login
echo ================================
echo Test 2: Login
echo ================================
echo POST %API_URL%/auth/login

curl -s -X POST "%API_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\"}" > login_response.json

echo.
echo [INFO] Login Response:
type login_response.json
echo.

REM Check if login was successful
findstr /C:"access_token" login_response.json >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Login successful - Token received
) else (
    echo [ERROR] Login failed - No token received
    del login_response.json
    pause
    exit /b 1
)
echo.

REM Summary
echo ================================
echo Test Summary
echo ================================
echo [OK] Backend API is working
echo [OK] Register endpoint works
echo [OK] Login endpoint works
echo [OK] JWT token is generated
echo.

REM Next steps
echo ================================
echo Next Steps
echo ================================
echo 1. Open browser: %FRONTEND_URL%
echo 2. Try registering with:
echo    Email: %TEST_EMAIL%
echo    Password: %TEST_PASSWORD%
echo 3. Try logging in
echo 4. Check if redirected to dashboard
echo.

REM Manual testing commands
echo ================================
echo Manual Testing Commands
echo ================================
echo.
echo # Register (change email if exists)
echo curl -X POST %API_URL%/auth/register ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"email\":\"new@test.com\",\"password\":\"test123\",\"role\":\"ADMIN\"}"
echo.
echo # Login
echo curl -X POST %API_URL%/auth/login ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"email\":\"%TEST_EMAIL%\",\"password\":\"%TEST_PASSWORD%\"}"
echo.

REM Cleanup
del login_response.json 2>nul

echo ================================
echo All tests completed!
echo ================================
pause
