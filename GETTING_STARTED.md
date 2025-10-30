# Guía de Inicio Rápido

## 🚀 Pasos para empezar

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:
- **DATABASE_URL**: Tu conexión a PostgreSQL o MySQL
- **NEXTAUTH_SECRET**: Genera uno con `openssl rand -base64 32`
- **VAPID Keys**: Genera en https://vapidkeys.com/

### 2. Configurar base de datos

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Crear íconos PWA

Necesitas dos archivos en la carpeta `public/`:
- `icon-192x192.png` (192x192 px)
- `icon-512x512.png` (512x512 px)

Puedes generarlos en: https://realfavicongenerator.net/

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

### 5. Poblar la base de datos (opcional)

Usa Prisma Studio para agregar versículos y devocionales:

```bash
npx prisma studio
```

## 📊 Estructura del Proyecto

```
selapp/
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── public/
│   └── manifest.json          # Configuración PWA
├── src/
│   ├── app/
│   │   ├── api/               # Rutas API
│   │   │   ├── devotionals/
│   │   │   ├── notes/
│   │   │   └── push/
│   │   ├── devotionals/       # Página de devocionales
│   │   ├── notes/             # Página de notas
│   │   ├── layout.tsx
│   │   └── page.tsx           # Página principal
│   ├── components/
│   │   └── PushNotifications.tsx
│   └── lib/
│       └── prisma.ts          # Cliente Prisma
├── .env                       # Variables de entorno (no incluido)
├── .env.example               # Ejemplo de variables
└── README.md                  # Documentación completa
```

## 🔧 Comandos útiles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Base de datos
npx prisma studio          # Explorar base de datos
npx prisma migrate dev     # Crear migraciones
npx prisma generate        # Generar cliente

# Código
npm run lint               # Verificar código
```

## ⚠️ Importante

- Cambia el `userId: "user-id-placeholder"` en las páginas cuando implementes autenticación completa
- No compartas tu archivo `.env`
- Genera nuevas claves VAPID para producción
- Usa HTTPS en producción para notificaciones push

## 📝 Próximas mejoras sugeridas

- [ ] Implementar autenticación completa con NextAuth
- [ ] Agregar búsqueda de notas
- [ ] Sistema de etiquetas para organizar notas
- [ ] Dashboard de estadísticas
- [ ] Exportar notas a PDF
- [ ] Modo oscuro persistente
- [ ] Sincronización con n8n
