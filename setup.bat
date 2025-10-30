@echo off
echo ============================================
echo   Aplicacion de Devocionales y Notas - PWA
echo ============================================
echo.
echo Este script te ayudara a configurar el proyecto.
echo.
echo ============================================
echo   PASO 1: Configurar Variables de Entorno
echo ============================================
echo.

if not exist .env (
    echo Copiando .env.example a .env...
    copy .env.example .env
    echo.
    echo [OK] Archivo .env creado.
    echo [IMPORTANTE] Ahora debes editar el archivo .env con tus datos:
    echo   - DATABASE_URL: Tu conexion a PostgreSQL
    echo   - NEXTAUTH_SECRET: Genera uno con: openssl rand -base64 32
    echo   - VAPID Keys: Genera en https://vapidkeys.com/
    echo.
    pause
) else (
    echo [OK] El archivo .env ya existe.
    echo.
)

echo ============================================
echo   PASO 2: Instalar Dependencias
echo ============================================
echo.
echo Instalando paquetes de Node.js...
call npm install
echo.
echo [OK] Dependencias instaladas.
echo.

echo ============================================
echo   PASO 3: Configurar Base de Datos
echo ============================================
echo.
echo [IMPORTANTE] Antes de continuar, asegurate de:
echo   1. PostgreSQL o MySQL este ejecutandose
echo   2. Haber configurado DATABASE_URL en .env
echo.
set /p continuar="¿Has configurado la base de datos? (S/N): "

if /i "%continuar%"=="S" (
    echo.
    echo Ejecutando migraciones de Prisma...
    call npx prisma migrate dev --name init
    echo.
    echo Generando cliente de Prisma...
    call npx prisma generate
    echo.
    echo [OK] Base de datos configurada.
    echo.
    
    set /p seed="¿Quieres poblar la BD con datos de ejemplo? (S/N): "
    if /i "%seed%"=="S" (
        echo.
        echo Poblando base de datos...
        call npm run db:seed
        echo.
        echo [OK] Datos de ejemplo agregados.
        echo.
    )
) else (
    echo.
    echo [PENDIENTE] Recuerda configurar la base de datos mas tarde.
    echo Ejecuta manualmente:
    echo   npx prisma migrate dev --name init
    echo   npx prisma generate
    echo.
)

echo ============================================
echo   PASO 4: Iconos PWA
echo ============================================
echo.
echo [RECORDATORIO] Necesitas crear dos iconos:
echo   - public/icon-192x192.png (192x192 pixeles)
echo   - public/icon-512x512.png (512x512 pixeles)
echo.
echo Puedes generarlos en:
echo   https://realfavicongenerator.net/
echo   https://www.pwabuilder.com/imageGenerator
echo.
pause

echo ============================================
echo   PASO 5: Iniciar la Aplicacion
echo ============================================
echo.
echo Todo listo! Ahora puedes iniciar la aplicacion con:
echo   npm run dev
echo.
set /p iniciar="¿Quieres iniciar la aplicacion ahora? (S/N): "

if /i "%iniciar%"=="S" (
    echo.
    echo Iniciando servidor de desarrollo...
    echo Abre tu navegador en: http://localhost:3000
    echo.
    echo [Presiona Ctrl+C para detener el servidor]
    echo.
    call npm run dev
) else (
    echo.
    echo Cuando quieras iniciar la aplicacion, ejecuta:
    echo   npm run dev
    echo.
)

echo.
echo ============================================
echo   Configuracion completada!
echo ============================================
echo.
echo Documentacion disponible:
echo   - INICIO.md           : Guia completa de inicio
echo   - README.md           : Documentacion tecnica
echo   - GETTING_STARTED.md  : Guia rapida
echo   - N8N_INTEGRATION.md  : Integracion con n8n
echo.
echo Comandos utiles:
echo   npm run dev         : Iniciar desarrollo
echo   npx prisma studio   : Explorar base de datos
echo   npm run db:seed     : Poblar con datos de ejemplo
echo.
pause
