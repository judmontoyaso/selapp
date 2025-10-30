# Devocionales y Notas - Aplicación PWA

Una aplicación web progresiva (PWA) con Next.js para gestionar devocionales diarios y notas de predicación.

## 🌟 Características

- **Devocionales Diarios**: Recibe versículos y preguntas de reflexión todos los días
- **Notas de Predicación**: Guarda y organiza tus notas de sermones en una interfaz tipo chat
- **Notificaciones Push**: Recordatorios diarios para tu tiempo devocional
- **PWA**: Funciona offline y se puede instalar en tu dispositivo
- **Base de Datos**: Almacenamiento persistente con PostgreSQL/MySQL
- **Integración**: Compatible con flujos de n8n

## 🚀 Tecnologías

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Prisma ORM (PostgreSQL/MySQL)
- **Autenticación**: NextAuth.js
- **PWA**: next-pwa
- **Notificaciones**: Web Push API

## 📋 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL o MySQL instalado
- Cuenta de correo para notificaciones (opcional)

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/devocionales?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-aqui"

# Web Push (genera las keys en https://vapidkeys.com/)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="tu-clave-publica-vapid"
VAPID_PRIVATE_KEY="tu-clave-privada-vapid"

# Opcional: n8n webhook
N8N_WEBHOOK_URL="https://tu-instancia-n8n.com/webhook/devotionals"
```

4. **Configurar la base de datos**

```bash
# Crear la base de datos y tablas
npx prisma migrate dev --name init

# Generar el cliente de Prisma
npx prisma generate
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Estructura de la Base de Datos

### Modelos Principales

- **User**: Usuarios de la aplicación
- **Verse**: Versículos bíblicos con referencia y tema
- **Devotional**: Devocionales con contenido y preguntas
- **DailyDevotional**: Programación diaria de devocionales para usuarios
- **Note**: Notas de predicación
- **PushSubscription**: Suscripciones a notificaciones push

## 🎨 Uso

### Devocionales

1. Visita `/devotionals` para ver el devocional del día
2. Lee los versículos y el contenido
3. Responde las preguntas de reflexión
4. Marca como completado

### Notas de Predicación

1. Visita `/notes` para ver tus notas
2. Escribe el título (opcional) y el contenido
3. Guarda la nota
4. Revisa tus notas anteriores organizadas por fecha

### Notificaciones

Las notificaciones push te recordarán tu tiempo devocional diario. El sistema solicitará permisos automáticamente.

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Ejecutar en producción
npm start

# Linting
npm run lint

# Prisma Studio (explorar base de datos)
npx prisma studio
```

## 🌐 Integración con n8n

La aplicación puede integrarse con n8n para:
- Programar devocionales automáticamente
- Enviar notificaciones
- Sincronizar con otros sistemas

Configura la variable `N8N_WEBHOOK_URL` en tu archivo `.env`.

## 📱 Instalación como PWA

1. Abre la aplicación en tu navegador
2. En Chrome/Edge: Haz clic en el icono de instalación en la barra de direcciones
3. En Safari (iOS): Toca "Compartir" > "Añadir a pantalla de inicio"

## 🔒 Seguridad

- Las contraseñas se almacenan hasheadas
- HTTPS requerido en producción para notificaciones push
- Variables de entorno para datos sensibles
- CORS configurado adecuadamente

## 📝 Migración desde Telegram/Notion

Para migrar tus datos existentes:

1. Exporta tus versículos desde tu base de datos actual
2. Usa Prisma para importarlos al modelo `Verse`
3. Crea devocionales en el modelo `Devotional`
4. Las notas de Telegram pueden importarse manualmente o mediante script

## 🤝 Contribución

Este es un proyecto personal. Si encuentras bugs o tienes sugerencias, siéntete libre de hacer fork y mejorar.

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 🙏 Agradecimientos

Desarrollado como una solución para reemplazar el sistema de Telegram bloqueado, permitiendo continuar con devocionales y notas de predicación.

---

**Nota**: Recuerda cambiar todas las claves y secretos en producción. No compartas tu archivo `.env`.
