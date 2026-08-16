@echo off
cd /d "%~dp0"
echo Demarrage du serveur local pour l'article 79...
start "Serveur article 79" /MIN cmd /c "python -m http.server 8765 --bind 127.0.0.1"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8765/79-l-hiver-pierre-le-fouineur.html"
echo.
echo Lien preview :
echo http://127.0.0.1:8765/79-l-hiver-pierre-le-fouineur.html
echo.
pause
