@echo off
setlocal enabledelayedexpansion
title Publicar MADVIZ en GitHub
color 0B
cd /d "%~dp0"

echo ============================================================
echo           MADVIZ - PUBLICAR SITIO WEB EN GITHUB
echo ============================================================
echo.

:: Verificar si hay cambios
git status --porcelain > "%temp%\git_status.txt"
set /p STATUS=<"%temp%\git_status.txt"
del "%temp%\git_status.txt" 2>nul

if "%STATUS%"=="" (
    color 0E
    echo [i] No hay cambios nuevos para subir. La web ya esta al dia.
    echo.
    goto FIN
)

echo Cambios detectados para publicar:
echo.
git status -s
echo.
echo ============================================================
set /p MSG="Descripcion del cambio (opcional, presiona Enter para usar fecha/hora): "

if "%MSG%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set FECHA=%%a-%%b-%%c
    for /f "tokens=1-2 delims=: " %%a in ("%time%") do set HORA=%%a:%%b
    set MSG=Actualizacion del sitio: !FECHA! !HORA!
)

echo.
echo [1/3] Preparando archivos...
git add .

echo [2/3] Guardando version...
git commit -m "%MSG%"

echo [3/3] Subiendo cambios a GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo ============================================================
    echo  EXITO: La web se subio correctamente a GitHub!
    echo  En 30-60 segundos los cambios estaran en vivo.
    echo ============================================================
) else (
    color 0C
    echo.
    echo ============================================================
    echo  ERROR: No se pudieron subir los cambios a GitHub.
    echo  Verifica tu conexion a internet o tus credenciales.
    echo ============================================================
)

:FIN
echo.
pause
