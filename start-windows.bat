@echo off
echo ================================================
echo    سیستم مدیریت موجودی انبار - ویندوز
echo ================================================
echo.

echo [1/2] راه‌اندازی Backend Server...
start "Backend Server" cmd /k "bun run server.ts"
timeout /t 3 /nobreak > nul
echo ✅ Backend Server اجرا شد (پورت 3000)
echo.

echo [2/2] راه‌اندازی Frontend Server...
start "Frontend Server" cmd /k "bunx expo start --web --port 8082"
timeout /t 5 /nobreak > nul
echo ✅ Frontend Server اجرا شد (پورت 8082)
echo.

echo ================================================
echo    ✅ سرورها با موفقیت راه‌اندازی شدند
echo ================================================
echo.
echo 📋 لینک‌های دسترسی:
echo.
echo 🔧 Backend API: http://localhost:3000
echo 📱 Frontend App: http://localhost:8082
echo.
echo ⚠️  دو پنجره CMD باز شده است - آنها را نبندید
echo.
pause
