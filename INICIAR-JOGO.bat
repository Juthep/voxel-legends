@echo off
setlocal
cd /d "%~dp0"
title Voxel Legends V0.1.1 - Instalar e Jogar
where node >nul 2>&1
if errorlevel 1 goto :semnode
where npm >nul 2>&1
if errorlevel 1 goto :semnode
echo.
echo =============================================
echo     VOXEL LEGENDS - V0.1.1 CORRIGIDO
 echo =============================================
echo.
if not exist "node_modules\vite\bin\vite.js" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 goto :erroinstalacao
) else (
  echo Dependencias encontradas.
)
echo.
echo Verificando codigo e compilando...
call npm run build
if errorlevel 1 goto :errocompilacao
echo.
echo Compilacao concluida. Abrindo o jogo...
start "" http://localhost:5173
call npm run dev
pause
exit /b 0
:semnode
echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org/
pause
exit /b 1
:erroinstalacao
echo Falha ao instalar dependencias. Verifique internet e npm.
pause
exit /b 1
:errocompilacao
echo O projeto nao compilou. Copie esta mensagem para corrigirmos o erro.
pause
exit /b 1
