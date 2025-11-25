# 📖 Sistema de Devocionales con IA

## 🎯 Descripción

Sistema completo de devocionales diarios que genera automáticamente:
- ✨ **Reflexiones profundas** basadas en versículos bíblicos
- ❓ **3 preguntas personalizadas** para cada devocional
- 💭 **Respuestas guardadas** de cada usuario
- 🤖 **Generación con OpenAI GPT-4**
- 🔗 **Integración con n8n** para automatización

---

## 📊 Estructura de Base de Datos

### Devotional
- `id`: ID único
- `date`: Fecha del devocional (única)
- `title`: Título inspirador
- `theme`: Tema del día
- `verseReference`: Referencia del versículo (ej: "Juan 3:16")
- `verseText`: Texto completo del versículo
- `reflection`: Reflexión generada por IA
- `questions`: Relación con preguntas

### DevotionalQuestion
- `id`: ID único
- `devotionalId`: Referencia al devocional
- `order`: Orden de la pregunta (1, 2, 3)
- `question`: Texto de la pregunta
- `questionType`: Tipo ("reflection", "action")

### DevotionalAnswer
- `id`: ID único
- `userId`: Usuario que responde
- `devotionalId`: Devocional respondido
- `questionId`: Pregunta específica
- `answer`: Respuesta del usuario

---

## 🚀 Uso

### 1. Configurar OpenAI

Agrega tu API key al `.env`:
```env
OPENAI_API_KEY="sk-proj-..."
```

### 2. Ejecutar migración de base de datos

```bash
npx prisma migrate dev --name add_devotionals
npx prisma generate
```

### 3. Crear devocional manualmente

**POST** `/api/devotionals-ai`

```json
{
  "date": "2025-11-26",
  "verseReference": "Juan 3:16",
  "verseText": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, sino que tenga vida eterna.",
  "theme": "Amor de Dios",
  "useAI": true
}
```

Respuesta:
```json
{
  "id": "...",
  "title": "El Amor Infinito de Dios",
  "reflection": "...",
  "questions": [
    {
      "id": "...",
      "question": "¿Cómo puedes experimentar el amor de Dios en tu vida diaria?",
      "questionType": "reflection",
      "order": 1
    },
    ...
  ]
}
```

### 4. Obtener devocional del día

**GET** `/api/devotionals-ai?date=2025-11-26&includeAnswers=true`

### 5. Responder preguntas

**POST** `/api/devotionals-ai/answers`

```json
{
  "devotionalId": "...",
  "questionId": "...",
  "answer": "Puedo experimentar el amor de Dios cuando..."
}
```

---

## 🔗 Integración con n8n

### Webhook de n8n

**Endpoint:** `POST /api/webhooks/n8n/devotionals`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_N8N_WEBHOOK_SECRET
```

**Body:**
```json
{
  "date": "2025-11-26",
  "verseReference": "Juan 3:16",
  "verseText": "Porque de tal manera amó Dios al mundo...",
  "theme": "Amor de Dios",
  "book": "Juan",
  "chapter": 3,
  "verse": "16",
  "generateWithAI": true
}
```

### Flujo de n8n sugerido

1. **Trigger diario** (Cron) a las 5:00 AM
2. **Obtener versículo** de tu fuente de datos
3. **HTTP Request** al webhook de Selapp
4. **Notificar** usuarios (opcional)

---

## 🤖 Generación con OpenAI

El sistema usa **GPT-4-mini** para generar:

**Prompt incluye:**
- Versículo y referencia
- Tema del devocional
- Instrucciones para crear:
  - Título inspirador (máximo 50 caracteres)
  - Reflexión profunda (200-300 palabras)
  - 3 preguntas:
    1. Reflexión personal
    2. Aplicación práctica
    3. Compromiso semanal

**Ejemplo de output:**
```json
{
  "title": "Viviendo el Amor Divino",
  "reflection": "El amor de Dios no es un concepto abstracto...",
  "questions": [
    {
      "question": "¿De qué manera específica has sentido el amor de Dios en tu vida esta semana?",
      "type": "reflection"
    },
    {
      "question": "¿Qué acción concreta puedes tomar hoy para compartir ese amor con alguien más?",
      "type": "action"
    },
    {
      "question": "¿Cómo te comprometes a vivir este versículo en los próximos 7 días?",
      "type": "action"
    }
  ]
}
```

---

## 📝 Variables de Entorno

```env
# OpenAI
OPENAI_API_KEY="sk-proj-..."

# n8n Webhook
N8N_WEBHOOK_SECRET="generar-con-crypto.randomBytes"
```

---

## 🎨 Frontend (Próximo paso)

Crear página `/devotionals-ai` con:
- 📅 Calendario de devocionales
- 📖 Vista del devocional del día
- ✍️ Formulario para responder preguntas
- 📊 Historial de respuestas
- 🔔 Notificación diaria

---

## 🔐 Seguridad

- ✅ Webhook protegido con Bearer token
- ✅ Autenticación requerida para responder
- ✅ Rate limiting en OpenAI (límite de tokens)
- ✅ Validación de datos de entrada

---

## 💡 Características Adicionales

### Futuras mejoras:
- 📊 Analytics de participación
- 🏆 Gamificación (rachas de devocionales)
- 👥 Compartir reflexiones con comunidad
- 🔔 Notificaciones push de devocionales
- 📱 Widget de devocional en home
- 🎯 Devocionales temáticos (Navidad, Semana Santa, etc.)

---

## 🐛 Troubleshooting

### Error: "OpenAI API key not found"
Verifica que `OPENAI_API_KEY` esté en `.env`

### Error: "Devotional already exists for this date"
La fecha debe ser única, usa otra fecha o actualiza el existente

### No se generan preguntas
Revisa la respuesta de OpenAI en logs del servidor

### Webhook falla con 401
Verifica que el header `Authorization` tenga el token correcto

---

¡Listo para crear devocionales profundos y personalizados! 🙏✨
