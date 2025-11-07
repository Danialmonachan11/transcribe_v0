@echo off
echo Installing Screen Docs dependencies...
echo.

echo [1/3] Installing root dependencies...
call npm install concurrently
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [2/3] Installing web-app dependencies...
cd web-app
echo Note: You may see some warnings about patch-package - these can be safely ignored.
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo Warning: Some post-install scripts failed, but continuing anyway...
    echo Installing required esbuild binary...
    call npm install @esbuild/win32-x64 --save-optional --legacy-peer-deps
)

echo.
echo [3/3] Installing backend dependencies...
cd ..\backend
call npm install --legacy-peer-deps --ignore-scripts
if %errorlevel% neq 0 exit /b %errorlevel%

cd ..

echo.
echo ✓ All dependencies installed successfully!
echo.
echo Run 'npm run dev' to start the application.
