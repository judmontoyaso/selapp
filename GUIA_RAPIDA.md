# 📝 Notas de Predicación - Sistema de Chat

## ✅ ¡Proyecto Listo para Usar!

Tu aplicación de notas de predicación está **100% funcional** y conectada a Supabase.

---

## 🎯 ¿Qué es esto?

Una aplicación web tipo **WhatsApp/Telegram** para guardar tus notas de sermones:

- ✅ **Interfaz de chat** para escribir mensajes
- ✅ **Adjuntar imágenes** a tus notas
- ✅ **Organizado por sermón** (título, pastor, fecha)
- ✅ **Todo en la nube** (Supabase PostgreSQL)
- ✅ **Imágenes en bucket** público de Supabase

---

## 🚀 Cómo Usar

### 1. Iniciar la Aplicación

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

### 2. Crear un Sermón

1. Haz clic en **"Ver Sermones"**
2. Haz clic en **"+ Nuevo Sermón"**
3. Completa:
   - **Título**: Ej. "El amor de Dios"
   - **Pastor**: Tu nombre o el del predicador
   - **Fecha**: Fecha del sermón

### 3. Tomar Notas (Como Chat)

1. Haz clic en el sermón que creaste
2. Verás una **interfaz tipo WhatsApp**
3. Escribe tus notas en el campo de texto
4. Presiona **➤** para enviar cada mensaje
5. Puedes escribir múltiples mensajes seguidos

### 4. Adjuntar Imágenes

1. Haz clic en el botón **📎** (clip)
2. Selecciona una o varias imágenes
3. Verás la vista previa
4. Escribe un mensaje (o déjalo vacío)
5. Presiona **➤** para enviar

---

## 📊 Estructura de la Base de Datos

### Tablas Creadas en Supabase:

#### 1. `sermons` (Sermones)
- `id` - ID único
- `title` - Título del sermón
- `pastor` - Nombre del pastor
- `date` - Fecha del sermón
- `createdAt` / `updatedAt` - Timestamps

#### 2. `messages` (Mensajes)
- `id` - ID único
- `sermonId` - ID del sermón (relación)
- `content` - Texto del mensaje
- `order` - Orden del mensaje
- `createdAt` - Cuándo se envió

#### 3. `images` (Imágenes)
- `id` - ID único
- `messageId` - ID del mensaje (relación)
- `url` - URL pública en Supabase Storage
- `fileName` - Nombre del archivo
- `fileSize` - Tamaño en bytes
- `createdAt` - Timestamp

---

## 🖼️ Configuración de Imágenes (Importante)

### ⚠️ Pendiente: Configurar Supabase Storage

Para que las imágenes funcionen, necesitas:

#### 1. Obtener las claves de Supabase

Ve a tu proyecto en Supabase:
- https://supabase.com/dashboard/project/dwwzqwcoqlasgvpniwiu

**Settings > API**:
- Copia el `anon public key`
- Copia el `service_role key` (¡mantenlo secreto!)

#### 2. Actualizar `.env`

Edita el archivo `.env` y agrega:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-clave-anon-aqui"
SUPABASE_SERVICE_ROLE_KEY="tu-clave-service-role-aqui"
```

#### 3. Configurar Políticas del Bucket

Ve a **Storage > Data_bucket** en Supabase y agrega estas políticas:

**Política de INSERT (para subir):**
```sql
CREATE POLICY "Permitir subir imágenes"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'Data_bucket');
```

**Política de SELECT (para leer):**
```sql
CREATE POLICY "Permitir leer imágenes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'Data_bucket');
```

O más simple, en la UI de Supabase:
1. Ve a Storage > Data_bucket
2. Click en "Policies"
3. Click "New Policy"
4. Selecciona "Allow public access" para INSERT y SELECT

---

## 🎨 Características de la Interfaz

### Página Principal
- Dashboard simple con acceso a sermones

### Lista de Sermones
- Cards con:
  - Título del sermón
  - Pastor
  - Fecha
  - Número de mensajes
- Botón para crear nuevo sermón

### Chat de Sermón (Lo Principal)
- **Header azul** con título, pastor y fecha
- **Área de mensajes** tipo WhatsApp
  - Mensajes alineados a la derecha (azul)
  - Hora de envío
  - Imágenes clicables
- **Campo de entrada** con:
  - Botón para adjuntar imágenes (📎)
  - Input de texto
  - Botón enviar (➤)
- **Vista previa** de imágenes antes de enviar

---

## 💡 Consejos de Uso

### Para Tomar Notas Durante un Sermón:

1. **Antes del servicio**: Crea el sermón con título y pastor
2. **Durante el sermón**: 
   - Escribe puntos clave como mensajes separados
   - Toma fotos de las diapositivas o pizarra
   - Adjúntalas inmediatamente
3. **Después**: Revisa tus notas en orden cronológico

### Ejemplos de Mensajes:

```
Punto 1: El amor de Dios es incondicional
```

```
Versículo clave: Juan 3:16
```

```
📷 [Imagen de la diapositiva con el outline]
```

```
Aplicación práctica:
- Orar más
- Leer la Biblia diariamente
- Servir en la iglesia
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor

# Base de Datos
npx prisma studio              # Ver datos en UI
npx prisma migrate dev         # Crear nueva migración
npx prisma generate            # Regenerar cliente

# Producción
npm run build                  # Compilar
npm start                      # Ejecutar producción
```

---

## 📱 Usar en Móvil

1. Asegúrate de estar en la misma red WiFi
2. Encuentra tu IP local:
   ```bash
   ipconfig  # En Windows
   ```
3. Abre en tu móvil:
   ```
   http://TU-IP:3000
   ```
   Ejemplo: `http://192.168.1.5:3000`

---

## 🌐 Desplegar en Producción

### Opción 1: Vercel (Recomendado)

1. Sube tu código a GitHub
2. Conecta con Vercel (vercel.com)
3. Configura variables de entorno:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_STORAGE_BUCKET`
4. Despliega

### Opción 2: Render, Railway, etc.

Similar, solo agrega las variables de entorno.

---

## ⚠️ Solución de Problemas

### Las imágenes no se suben
- Verifica que configuraste las claves de Supabase en `.env`
- Verifica las políticas del bucket
- Revisa la consola del navegador (F12)

### No se conecta a la base de datos
- Verifica que `DATABASE_URL` sea correcta
- Ejecuta `npx prisma generate`

### Error de CORS con Supabase
- Asegúrate de usar las claves correctas
- Verifica que el bucket sea público

---

## 📊 API Endpoints

Si quieres integrar con otras herramientas:

### Sermones
- `GET /api/sermons` - Listar todos
- `POST /api/sermons` - Crear nuevo
- `GET /api/sermons/[id]` - Ver uno específico
- `PUT /api/sermons/[id]` - Actualizar
- `DELETE /api/sermons/[id]` - Eliminar

### Mensajes
- `POST /api/sermons/[id]/messages` - Crear mensaje

### Imágenes
- `POST /api/upload` - Subir imagen

---

## 🎯 Siguiente Nivel

Ideas para mejorar la app:

- [ ] Búsqueda de sermones
- [ ] Filtros por pastor o fecha
- [ ] Exportar sermón a PDF
- [ ] Compartir notas
- [ ] Sistema de etiquetas
- [ ] Modo oscuro persistente
- [ ] Editar/eliminar mensajes
- [ ] Audio/video adjuntos
- [ ] Multi-usuario con autenticación

---

## 📝 Notas Técnicas

- **Framework**: Next.js 15 con App Router
- **Base de Datos**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **ORM**: Prisma
- **Estilos**: Tailwind CSS
- **Lenguaje**: TypeScript

---

**¡Tu aplicación está lista! 🎉**

Ejecuta `npm run dev` y empieza a tomar notas de tus sermones.

Para configurar las imágenes, sigue la sección **"Configuración de Imágenes"** arriba.
