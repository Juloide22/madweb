@echo off
cd /d "%~dp0"
echo ============================================================
echo       MADVIZ -- ACTUALIZANDO GALERIA GENERAL
echo ============================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar_galeria.ps1"
echo.
echo ============================================================
echo Listo! Podes abrir archive.html para ver la galeria.
echo ============================================================
echo.
pause
