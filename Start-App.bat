@echo off
chcp 65001 > nul
title اديني واحدة ⲙⲟⲓ ⲛⲏⲓ
echo ===================================================
echo   جاري تشغيل تطبيق اديني واحدة ⲙⲟⲓ ⲛⲏⲓ...
echo ===================================================
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
