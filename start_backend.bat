@echo off
setlocal
cd /d "%~dp0"

set "PYTHON=%LOCALAPPDATA%\Microsoft\WindowsApps\python3.12.exe"
if not exist "%PYTHON%" (
    echo Python 3.12 was not found at "%PYTHON%".
    echo Install Python 3.12, then try again.
    pause
    exit /b 1
)

"%PYTHON%" -c "import fastapi, numpy, PIL, tensorflow, uvicorn" >nul 2>&1
if errorlevel 1 (
    echo Installing backend dependencies...
    "%PYTHON%" -m pip install -r requirements.txt
    if errorlevel 1 (
        echo Dependency installation failed.
        pause
        exit /b 1
    )
)

"%PYTHON%" -m uvicorn backend.main:app --reload
if errorlevel 1 pause
