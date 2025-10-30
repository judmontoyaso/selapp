# Integración con n8n

Esta guía explica cómo integrar tu aplicación de devocionales con n8n para automatizar procesos.

## 🔄 Casos de Uso

### 1. Programar Devocionales Automáticamente
n8n puede crear devocionales automáticamente cada día usando tus versículos.

### 2. Enviar Notificaciones
Trigger automático de notificaciones push a horas específicas.

### 3. Sincronizar con Otras Plataformas
Mantener sincronizados tus devocionales con Notion, Google Sheets, etc.

### 4. Importar Datos
Importar versículos y devocionales desde diferentes fuentes.

---

## 📡 Endpoints API Disponibles

### Devocionales

#### GET /api/devotionals
Obtener lista de devocionales
```bash
curl http://localhost:3000/api/devotionals
```

Query parameters:
- `topic`: Filtrar por tema

#### POST /api/devotionals
Crear nuevo devocional
```bash
curl -X POST http://localhost:3000/api/devotionals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "El Amor de Dios",
    "topic": "Amor",
    "content": "Contenido del devocional...",
    "questions": ["Pregunta 1", "Pregunta 2"],
    "verseIds": ["verse-id-1", "verse-id-2"]
  }'
```

#### GET /api/devotionals/today
Obtener devocional del día
```bash
curl http://localhost:3000/api/devotionals/today
```

#### POST /api/devotionals/today
Completar devocional del día
```bash
curl -X POST http://localhost:3000/api/devotionals/today \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "answers": ["Respuesta 1", "Respuesta 2"]
  }'
```

### Notas

#### GET /api/notes
Obtener notas del usuario
```bash
curl http://localhost:3000/api/notes?userId=user-id
```

Query parameters:
- `userId`: ID del usuario (requerido)
- `category`: Filtrar por categoría

#### POST /api/notes
Crear nueva nota
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "title": "Título de la nota",
    "content": "Contenido...",
    "category": "sermon",
    "tags": ["etiqueta1", "etiqueta2"]
  }'
```

### Notificaciones Push

#### POST /api/push/subscribe
Suscribir a notificaciones
```bash
curl -X POST http://localhost:3000/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "subscription": {
      "endpoint": "...",
      "keys": {"p256dh": "...", "auth": "..."}
    }
  }'
```

---

## 🛠️ Ejemplos de Workflows en n8n

### Workflow 1: Crear Devocional Diario Automático

**Trigger**: Schedule (todos los días a las 5:00 AM)

**Nodos**:
1. **Schedule Trigger** - Ejecutar diariamente
2. **HTTP Request** - Obtener versículo aleatorio de tu BD
3. **HTTP Request** - Crear devocional
4. **HTTP Request** - Programar para todos los usuarios

```json
{
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "hours", "hoursInterval": 24}]
        }
      }
    },
    {
      "name": "Create Devotional",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3000/api/devotionals",
        "bodyParameters": {
          "title": "Devocional del Día",
          "topic": "Fe",
          "content": "Contenido generado...",
          "questions": ["Pregunta 1", "Pregunta 2"],
          "verseIds": ["id1", "id2"]
        }
      }
    }
  ]
}
```

### Workflow 2: Notificación Diaria de Devocional

**Trigger**: Schedule (todos los días a las 7:00 AM)

**Nodos**:
1. **Schedule Trigger**
2. **HTTP Request** - Obtener usuarios activos de la BD
3. **Loop Over Items**
4. **HTTP Request** - Enviar notificación push a cada usuario

### Workflow 3: Importar Versículos desde Google Sheets

**Trigger**: Manual o Schedule

**Nodos**:
1. **Google Sheets** - Leer hoja de versículos
2. **Loop Over Items**
3. **HTTP Request** - Crear versículo en BD vía API

### Workflow 4: Backup Diario a Notion

**Trigger**: Schedule (diario)

**Nodos**:
1. **Schedule Trigger**
2. **HTTP Request** - Obtener devocionales del día
3. **Notion** - Crear página con el devocional
4. **HTTP Request** - Obtener notas nuevas
5. **Notion** - Actualizar base de datos de notas

---

## 🔐 Autenticación en n8n

Para mayor seguridad, puedes agregar autenticación a tus endpoints:

### Opción 1: API Key Simple
Agrega un header `X-API-Key` en tus requests desde n8n:

```javascript
// En n8n HTTP Request node, Headers:
{
  "X-API-Key": "tu-clave-secreta"
}
```

Luego valida en tus API routes:
```typescript
// src/app/api/devotionals/route.ts
export async function POST(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  if (apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... resto del código
}
```

### Opción 2: Webhook Seguro
Usa webhooks con tokens únicos en la URL.

---

## 📊 Llamadas Directas a Base de Datos

Si prefieres que n8n acceda directamente a tu base de datos PostgreSQL:

1. Agrega el nodo **PostgreSQL** en n8n
2. Configura la conexión a tu BD
3. Ejecuta queries directamente

**Ventajas**:
- Más rápido
- No necesitas API

**Desventajas**:
- Menos seguro
- No aprovechas la lógica de la app
- Más difícil de mantener

---

## 🎯 Webhook desde la App hacia n8n

Puedes hacer que tu app notifique a n8n cuando ocurran eventos:

### Configurar Webhook en n8n:
1. Crea un workflow nuevo
2. Agrega nodo **Webhook**
3. Obtén la URL del webhook

### Configurar en la App:
Agrega la URL a tu `.env`:
```env
N8N_WEBHOOK_URL="https://tu-n8n.com/webhook/devotional-completed"
```

### Llamar al Webhook:
```typescript
// Cuando un usuario completa un devocional
await fetch(process.env.N8N_WEBHOOK_URL!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'devotional_completed',
    userId: user.id,
    devotionalId: devotional.id,
    timestamp: new Date().toISOString(),
    answers: answers
  })
});
```

### Usar en n8n:
El webhook recibirá el evento y puedes:
- Enviar email de felicitación
- Actualizar estadísticas en Google Sheets
- Notificar a tu equipo pastoral
- Registrar en analytics

---

## 🔄 Sincronización Bidireccional

Para mantener sincronizados Notion y tu app:

### App → Notion:
Cuando se crea una nota, n8n la guarda en Notion.

### Notion → App:
Webhook de Notion cuando se actualiza una página → n8n llama a tu API para actualizar.

---

## 📱 Notificaciones Push desde n8n

Para enviar notificaciones push desde n8n:

1. **Obtén las suscripciones** de la BD:
```sql
SELECT * FROM push_subscriptions WHERE user_id = 'user-id'
```

2. **Usa web-push** en un Code node de n8n:
```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  'PUBLIC_VAPID_KEY',
  'PRIVATE_VAPID_KEY'
);

const subscription = {
  endpoint: items[0].json.endpoint,
  keys: items[0].json.keys
};

const payload = JSON.stringify({
  title: 'Devocional del Día',
  body: 'Tu devocional está listo',
  icon: '/icon-192x192.png',
  data: { url: '/devotionals' }
});

await webpush.sendNotification(subscription, payload);

return items;
```

---

## 💡 Ideas Adicionales

### 1. Analytics
- Track cuántos devocionales se completan
- Qué temas son más populares
- Enviar reportes semanales

### 2. Recordatorios Inteligentes
- Si un usuario no completa el devocional, recordarle más tarde
- Adaptar hora de notificación según comportamiento

### 3. Contenido Personalizado
- Generar devocionales basados en temas que el usuario lee más
- Sugerencias de versículos relacionados

### 4. Compartir
- Permitir compartir devocionales completados en redes sociales
- n8n procesa y publica automáticamente

---

## 📚 Recursos

- [Documentación de n8n](https://docs.n8n.io/)
- [n8n HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ⚠️ Consideraciones de Seguridad

1. **No expongas credenciales** en n8n workflows públicos
2. **Usa HTTPS** en producción
3. **Valida entrada** de webhooks
4. **Rate limiting** para prevenir abuso
5. **Logs** de todas las operaciones importantes

---

**¡Automatiza y simplifica tu ministerio con n8n! 🚀**
