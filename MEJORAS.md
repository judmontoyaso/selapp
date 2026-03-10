# Plan de Mejoras - Selapp

## 1. Muro de Oraciones

### Descripción
Permite a los usuarios compartir peticiones de oración, ver oraciones de otros y marcar como "oradas".

### Funcionalidades
- [ ] Crear petición de oración pública o privada
- [ ] Ver muro de oraciones de la comunidad
- [ ] Marcar como "orada" (contador)
- [ ] Encender vela virtual
- [ ] Comentar en oraciones
- [ ] Notificaciones cuando alguien ora por ti

---

## 2. Exportar Notas a Notion/PDF

### 2.1 Exportar a PDF
- [ ] Exportar sermón individual a PDF
- [ ] Exportar diario a PDF (por rango de fechas)
- [ ] Exportar devocionales a PDF
- [ ] Exportar colección de sermones a PDF

### 2.2 Exportar a Notion
- [ ] Exportar sermón a página de Notion
- [ ] Sincronización bidireccional
- [ ] Mapear estructura a bloques de Notion

---

## 3. Mejorar Modo Offline

- [ ] Implementar Service Worker con Workbox
- [ ] Crear esquema IndexedDB
- [ ] Sincronización automática cuando hay conexión
- [ ] Indicador visual de estado offline
- [ ] Cachear imágenes y fuentes

---

## 4. Etiquetas y Búsqueda en Sermones

- [ ] Agregar modelo de etiquetas a Prisma
- [ ] Componente TagSelector
- [ ] Búsqueda en API con filtros
- [ ] UI de filtros (tags, fecha, pastor)

---

## 5. Paginación

- [ x] Componente Pagination reutilizable
- [ x] Offset-based pagination en API
- [ x] Skeleton loaders
- [ x] Mantener scroll position

---

## 6. Plan de Devocionales

- [ ] Modelos en Prisma
- [ ] Página de planes
- [ ] Componente PlanCard
- [ ] Lógica de progreso
- [ ] Planes por defecto
- [ ] Notificaciones de recordatorio

---

## Prioridades

| Prioridad | Feature |
|-----------|---------|
| Alta | Paginación |
| Alta | Búsqueda en sermones |
| Alta | Offline mejorado |
| Media | Plan de devocionales |
| Media | Muro de oraciones |
| Media | Exportar PDF |
| Baja | Exportar a Notion |
