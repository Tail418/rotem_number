@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 아인카페 서버를 시작합니다...
echo.

node server.js

echo.
echo 서버가 종료되었습니다. 이 창을 닫아도 됩니다.
pause
