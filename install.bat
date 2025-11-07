@echo off
echo Installing Screen Docs dependencies...
echo.

echo [1/3] Installing root dependencies...
call npm install concurrently
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [2/3] Installing web-app dependencies...
cd web-app
call npm install --legacy-peer-deps --ignore-scripts
if %errorlevel% neq 0 exit /b %errorlevel%

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
