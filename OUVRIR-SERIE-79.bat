@echo off
cd /d "%~dp0"
start "Serveur 79" /MIN cmd /c "python -m http.server 8765 --bind 127.0.0.1"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8765/preview-serie-79.html"
echo http://127.0.0.1:8765/preview-serie-79.html
echo Partie 1 : http://127.0.0.1:8765/79-l-hiver-pierre-le-fouineur.html
echo Partie 2 : http://127.0.0.1:8765/79-l-hiver-pierre-le-fouineur-partie-2.html
echo Partie 3 : http://127.0.0.1:8765/79-l-hiver-pierre-le-fouineur-partie-3.html
echo Partie 4 : http://127.0.0.1:8765/79-l-hiver-pierre-le-fouineur-partie-4.html
pause
