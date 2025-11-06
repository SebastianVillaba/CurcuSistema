@echo off
ECHO Ejecutando script de hardware...

:: 1. Cambiar al directorio donde se encuentra este script (.bat)
cd /d "%~dp0"

:: 2. Ejecutar el script de PowerShell (generar.ps1) y esperar
powershell -NoProfile -ExecutionPolicy Bypass -File "generar.ps1"

:: El script de PowerShell maneja el mensaje final y la pausa.