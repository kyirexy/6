@echo off
REM Build Next.js static export and sync to Capacitor Android
setlocal

echo ==^> Building static export for Capacitor...
set CAPACITOR_BUILD=true
if "%NEXT_PUBLIC_API_URL%"=="" set NEXT_PUBLIC_API_URL=http://10.0.2.2:8000
call npm run build
if errorlevel 1 goto :error

echo ==^> Syncing to Android...
call npx cap sync android
if errorlevel 1 goto :error

echo ==^> Done! Run 'npx cap open android' to open in Android Studio.
goto :eof

:error
echo ==^> Build failed!
exit /b 1
