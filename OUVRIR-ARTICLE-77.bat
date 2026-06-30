@echo off
cd /d "%~dp0"
echo Demarrage du serveur local pour l'article 77...
start "Serveur article 77" /MIN cmd /c "python -m http.server 8765 --bind 127.0.0.1"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8765/77-les-techniques-de-peche.html"
echo.
echo Si la page ne s'ouvre pas, copiez ce lien dans Chrome ou Edge :
echo http://127.0.0.1:8765/77-les-techniques-de-peche.html
echo.
pause
