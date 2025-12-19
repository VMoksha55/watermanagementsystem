@echo off
setlocal

REM === Edit these if you installed project elsewhere ===
REM Using %~dp0 to refer to the current folder where start.bat sits
set ROOT=%~dp0
set BACKEND_DIR=%ROOT%backend
set FRONTEND_FILE=%ROOT%frontend\index.html
set ESP32_DIR=%ROOT%esp32

REM 1) If docker-compose.yml exists, use it to start Mongo + backend; else assume local Mongo
if exist "%ROOT%docker-compose.yml" (
    start "Docker Compose" cmd /k "cd /d "%ROOT%" && docker-compose up --build"
) ELSE (
    echo No docker-compose.yml found - ensure MongoDB is running locally.
)

REM 2) Start backend
start "Backend" cmd /k "cd /d "%BACKEND_DIR%" && echo Starting backend... && npm start"

REM 3) Start simulator (Python)
start "Simulator" cmd /k "cd /d "%ESP32_DIR%" && echo Starting simulator... && python simulate_post.py"

REM 4) Wait a few seconds then open the dashboard file in your default browser
timeout /t 6 /nobreak >nul
start "" "%FRONTEND_FILE%"

echo All started. Check the opened windows for logs.
endlocal
pause