#!/bin/bash

echo "============================================"
echo "  Aplicación de Devocionales y Notas - PWA"
echo "============================================"
echo ""
echo "Este script te ayudará a configurar el proyecto."
echo ""

echo "============================================"
echo "  PASO 1: Configurar Variables de Entorno"
echo "============================================"
echo ""

if [ ! -f .env ]; then
    echo "Copiando .env.example a .env..."
    cp .env.example .env
    echo ""
    echo "[OK] Archivo .env creado."
    echo "[IMPORTANTE] Ahora debes editar el archivo .env con tus datos:"
    echo "  - DATABASE_URL: Tu conexión a PostgreSQL"
    echo "  - NEXTAUTH_SECRET: Genera uno con: openssl rand -base64 32"
    echo "  - VAPID Keys: Genera en https://vapidkeys.com/"
    echo ""
    read -p "Presiona Enter para continuar..."
else
    echo "[OK] El archivo .env ya existe."
    echo ""
fi

echo "============================================"
echo "  PASO 2: Instalar Dependencias"
echo "============================================"
echo ""
echo "Instalando paquetes de Node.js..."
npm install
echo ""
echo "[OK] Dependencias instaladas."
echo ""

echo "============================================"
echo "  PASO 3: Configurar Base de Datos"
echo "============================================"
echo ""
echo "[IMPORTANTE] Antes de continuar, asegúrate de:"
echo "  1. PostgreSQL o MySQL esté ejecutándose"
echo "  2. Haber configurado DATABASE_URL en .env"
echo ""
read -p "¿Has configurado la base de datos? (s/n): " continuar

if [ "$continuar" = "s" ] || [ "$continuar" = "S" ]; then
    echo ""
    echo "Ejecutando migraciones de Prisma..."
    npx prisma migrate dev --name init
    echo ""
    echo "Generando cliente de Prisma..."
    npx prisma generate
    echo ""
    echo "[OK] Base de datos configurada."
    echo ""
    
    read -p "¿Quieres poblar la BD con datos de ejemplo? (s/n): " seed
    if [ "$seed" = "s" ] || [ "$seed" = "S" ]; then
        echo ""
        echo "Poblando base de datos..."
        npm run db:seed
        echo ""
        echo "[OK] Datos de ejemplo agregados."
        echo ""
    fi
else
    echo ""
    echo "[PENDIENTE] Recuerda configurar la base de datos más tarde."
    echo "Ejecuta manualmente:"
    echo "  npx prisma migrate dev --name init"
    echo "  npx prisma generate"
    echo ""
fi

echo "============================================"
echo "  PASO 4: Iconos PWA"
echo "============================================"
echo ""
echo "[RECORDATORIO] Necesitas crear dos iconos:"
echo "  - public/icon-192x192.png (192x192 píxeles)"
echo "  - public/icon-512x512.png (512x512 píxeles)"
echo ""
echo "Puedes generarlos en:"
echo "  https://realfavicongenerator.net/"
echo "  https://www.pwabuilder.com/imageGenerator"
echo ""
read -p "Presiona Enter para continuar..."

echo "============================================"
echo "  PASO 5: Iniciar la Aplicación"
echo "============================================"
echo ""
echo "Todo listo! Ahora puedes iniciar la aplicación con:"
echo "  npm run dev"
echo ""
read -p "¿Quieres iniciar la aplicación ahora? (s/n): " iniciar

if [ "$iniciar" = "s" ] || [ "$iniciar" = "S" ]; then
    echo ""
    echo "Iniciando servidor de desarrollo..."
    echo "Abre tu navegador en: http://localhost:3000"
    echo ""
    echo "[Presiona Ctrl+C para detener el servidor]"
    echo ""
    npm run dev
else
    echo ""
    echo "Cuando quieras iniciar la aplicación, ejecuta:"
    echo "  npm run dev"
    echo ""
fi

echo ""
echo "============================================"
echo "  Configuración completada!"
echo "============================================"
echo ""
echo "Documentación disponible:"
echo "  - INICIO.md           : Guía completa de inicio"
echo "  - README.md           : Documentación técnica"
echo "  - GETTING_STARTED.md  : Guía rápida"
echo "  - N8N_INTEGRATION.md  : Integración con n8n"
echo ""
echo "Comandos útiles:"
echo "  npm run dev         : Iniciar desarrollo"
echo "  npx prisma studio   : Explorar base de datos"
echo "  npm run db:seed     : Poblar con datos de ejemplo"
echo ""
