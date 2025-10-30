# Next.js PWA - Aplicación de Devocionales y Notas de Predicación

## Estado del Proyecto
- [x] Crear archivo copilot-instructions.md
- [x] Obtener información de configuración del proyecto
- [x] Scaffold del proyecto Next.js
- [x] Configurar PWA
- [x] Crear esquema de base de datos
- [x] Implementar autenticación
- [x] Crear rutas API
- [x] Construir componentes UI
- [x] Instalar dependencias y compilar
- [x] Crear documentación README

## Descripción del Proyecto
Aplicación PWA con Next.js que reemplaza el sistema de Telegram para:
- Guardar notas de predicaciones (interfaz tipo chat)
- Enviar devocionales diarios con versículos y preguntas
- Notificaciones push
- Almacenamiento en base de datos
- Posible integración con n8n

## Stack Tecnológico
- Next.js 15 con App Router
- TypeScript
- PWA (Progressive Web App)
- Prisma ORM
- NextAuth.js
- Base de datos (PostgreSQL/MySQL)
- Tailwind CSS
- Push Notifications API

## Próximos Pasos

### 1. Configurar Base de Datos
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus credenciales de base de datos
# Luego ejecuta:
npx prisma migrate dev --name init
npx prisma generate
```

### 2. Generar Claves VAPID para Notificaciones
Visita https://vapidkeys.com/ y agrega las claves a tu archivo `.env`

### 3. Crear Íconos PWA
Genera íconos de 192x192 y 512x512 píxeles y colócalos en la carpeta `public/`

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

### 5. Importar Datos
- Importa tus versículos existentes a la tabla `verses`
- Crea devocionales en la tabla `devotionals`
- Las notas se guardarán automáticamente cuando uses la app

## Funcionalidades Implementadas
✅ Estructura del proyecto Next.js con TypeScript
✅ Configuración PWA con manifest.json
✅ Esquema de base de datos Prisma completo
✅ API Routes para devocionales, notas y notificaciones
✅ Páginas UI para devocionales y notas
✅ Sistema de notificaciones push
✅ Diseño responsive con Tailwind CSS
✅ Documentación completa en README.md

