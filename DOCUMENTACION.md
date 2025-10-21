# Plaza Coche - Documentación Completa

Sistema web para gestionar el alquiler de plazas de estacionamiento del IES Estació.

---

## Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Tecnologías](#tecnologías)
3. [Instalación](#instalación)
4. [Arquitectura](#arquitectura)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Endpoints API](#endpoints-api)
7. [Modelos de Datos](#modelos-de-datos)
8. [Sistema de Backup/Restore](#sistema-de-backuprestore)
9. [Usuarios de Prueba](#usuarios-de-prueba)
10. [Seguridad](#seguridad)
11. [Scripts Disponibles](#scripts-disponibles)
12. [Funcionalidades](#funcionalidades)
13. [Horario Semanal del Usuario](#horario-semanal-del-usuario)
14. [Asignación Automática de Cargador](#asignación-automática-de-cargador)
15. [Sistema de Pestañas](#sistema-de-pestañas)

---

## Inicio Rápido

### Opción 1: Script Automático (Recomendado)

**Windows:**

```powershell
cd plaza_coche
.\scripts_ps\start.ps1
```

**Linux/Mac:**

```bash
cd plaza_coche
./scripts_ps/start.sh
```

El script automáticamente:

-   Verifica Docker
-   Levanta los servicios
-   Restaura datos desde backup
-   Abre el navegador

### Opción 2: Manual

```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Restaurar datos (primera vez)
.\scripts_ps\restore-db.ps1  # Windows
./scripts_ps/restore-db.sh   # Linux/Mac

# 3. Acceder a http://localhost:8080
```

---

## Tecnologías

### Frontend

-   HTML5, CSS3
-   JavaScript ES6+ (Vanilla JS)
-   Patrón Singleton (ApiService, AuthService)
-   Fetch API
-   LocalStorage para JWT

### Backend

-   Node.js 18+
-   Express 4.18
-   Mongoose 7.0
-   JWT (jsonwebtoken 9.0)
-   Bcrypt 2.4
-   CORS
-   node-cron 3.0 (para cron jobs automáticos)
-   Patrón Singleton (Database)

### Base de Datos

-   MongoDB (latest)
-   Backups en formato JSON

### DevOps

-   Docker & Docker Compose
-   Nginx (Alpine) para frontend

---

## Instalación

### Requisitos Previos

-   Docker Desktop instalado
-   Git (para clonar el repositorio)

### Pasos

1. **Clonar repositorio**

```bash
git clone https://github.com/voromb/plaza_coche.git
cd plaza_coche
```

2. **Iniciar sistema**

```bash
.\scripts_ps\start.ps1  # Windows
./scripts_ps/start.sh   # Linux/Mac
```

3. **Acceder**

-   Frontend: http://localhost:8080
-   Backend: http://localhost:3010
-   MongoDB: localhost:27017

---

## Arquitectura

```
┌─────────────────────────────────────────┐
│         CLIENTE (Browser)               │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  index.html | user.html | admin  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │    JavaScript Singletons         │   │
│  │  • ApiService (HTTP)             │   │
│  │  • AuthService (JWT)             │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓ HTTP/JSON
┌─────────────────────────────────────────┐
│      SERVIDOR (Docker Containers)       │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  NGINX (Frontend)                │   │
│  │  Puerto: 8080                    │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  EXPRESS (Backend API)           │   │
│  │  Puerto: 3010                    │   │
│  │  • Routes (auth, user, admin)    │   │
│  │  • Middleware (JWT verify)       │   │
│  │  • Models (Mongoose)             │   │
│  └──────────────────────────────────┘   │
│                    ↓                    │
│  ┌──────────────────────────────────┐   │
│  │  MongoDB                         │   │
│  │  Puerto: 27017                   │   │
│  │  DB: plaza_coche                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Patrón Singleton

**Frontend:**

-   `ApiService` - Una instancia para todas las llamadas HTTP
-   `AuthService` - Una instancia para gestión de sesión

**Backend:**

-   `Database` - Una conexión única a MongoDB

---

## Estructura del Proyecto

```
plaza_coche/
│
├── backend/                    # API Express
│   ├── config/
│   │   └── db.js              # Singleton MongoDB
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js            # Schema de usuarios
│   │   ├── ParkingSpot.js     # Schema de plazas
│   │   └── Reservation.js     # Schema de reservas
│   ├── routes/
│   │   ├── auth.js            # Login/Register
│   │   ├── user.js            # Rutas de usuario
│   │   └── admin.js           # Rutas de admin
│   ├── server.js              # Punto de entrada
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                   # Interfaz web
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── ApiService.js      # Singleton HTTP
│   │   ├── AuthService.js     # Singleton Auth
│   │   ├── user.js            # Lógica usuario
│   │   └── admin.js           # Lógica admin
│   ├── index.html             # Login/Registro
│   ├── user.html              # Dashboard usuario
│   └── admin.html             # Dashboard admin
│
├── scripts_ps/                 # Scripts de automatización
│   ├── start.ps1/sh           # Inicio completo
│   ├── backup-db.ps1/sh       # Exportar BD
│   └── restore-db.ps1/sh      # Importar BD
│
├── db_backups/                 # Backups de MongoDB
│   └── *.json                 # Archivos de backup
│
├── docker-compose.yml          # Orquestación Docker
├── .env                        # Variables de entorno
└── README.md                   # Documentación principal
```

---

## Endpoints API

### Auth (Públicos)

| Método | Endpoint             | Descripción                   |
| ------ | -------------------- | ----------------------------- |
| POST   | `/api/auth/register` | Registrar nuevo usuario       |
| POST   | `/api/auth/login`    | Iniciar sesión (devuelve JWT) |

### User (Requiere JWT)

| Método | Endpoint                  | Descripción               |
|--------|---------------------------|--------------------------|
| GET    | `/api/user/parking-spots` | Listar plazas disponibles |
| POST   | `/api/user/schedule`      | Guardar horario semanal   |
| GET    | `/api/user/schedule`      | Obtener horario actual    |
| GET    | `/api/user/weekly-usage`  | Obtener uso semanal actual |
| POST   | `/api/user/weekly-usage/add` | Agregar horas al uso semanal |

### Admin (Requiere JWT + rol admin)

| Método | Endpoint                           | Descripción              |
|--------|-----------------------------------|--------------------------|
| GET    | `/api/admin/parking-spots`        | Todas las plazas         |
| POST   | `/api/admin/parking-spot`         | Crear plaza              |
| PUT    | `/api/admin/parking-spot/:id`     | Actualizar plaza         |
| DELETE | `/api/admin/parking-spot/:id`     | Eliminar plaza           |
| PUT    | `/api/admin/parking-spot/:id/toggle` | Activar/Desactivar plaza |
| POST   | `/api/admin/assign-plaza/:plazaId/user/:userId` | Asignar plaza a usuario |
| POST   | `/api/admin/unassign-plaza/:plazaId` | Liberar plaza |
| GET    | `/api/admin/user/:userId/horas-utilizadas` | Obtener horas de un usuario |
| PUT    | `/api/admin/user/:userId/horas-utilizadas` | Actualizar horas de un usuario |
| GET    | `/api/admin/usuarios-horas` | Obtener todos usuarios con sus horas |
| GET    | `/api/admin/user/:userId/weekly-usage` | Obtener uso semanal de un usuario |
| GET    | `/api/admin/user/:userId/usage-history` | Obtener histórico de uso de un usuario |
| PUT    | `/api/admin/user/:userId/weekly-usage` | Actualizar horas de un usuario |
| GET    | `/api/admin/users`                | Todos los usuarios       |

---

## Modelos de Datos

### User

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hash bcrypt),
  nombre: String,
  apellidos: String,
  role: 'user' | 'admin',
  horasUtilizadas: Number,
  createdAt: Date
}
```

### ParkingSpot

```javascript
{
  _id: ObjectId,
  numero: String (unique),
  ubicacion: String,
  descripcion: String,
  disponible: Boolean,
  activa: Boolean,
  createdAt: Date
}
```

### Reservation

```javascript
{
  _id: ObjectId,
  userId: ObjectId → User,
  parkingSpotId: ObjectId → ParkingSpot,
  fechaInicio: Date,
  fechaFin: Date,
  estado: 'activa' | 'completada' | 'cancelada',
  createdAt: Date
}
```

### Schedule

```javascript
{
  _id: ObjectId,
  userId: ObjectId → User,
  horarios: [
    {
      dia: String,
      horas: [Number]
    }
  ],
  mes: Number,
  año: Number,
  createdAt: Date
}
```

### WeeklyUsage

```javascript
{
  _id: ObjectId,
  userId: ObjectId → User,
  semana: String,          // Formato: YYYY-WW (ej: 2025-43)
  horasUtilizadas: Number, // Total de horas esta semana
  detalleHoras: [
    {
      dia: String,         // lunes, martes, miercoles, jueves, viernes
      horas: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Sistema de Backup/Restore

### Crear Backup

**Windows:**

```powershell
.\scripts_ps\backup-db.ps1
```

**Linux/Mac:**

```bash
./scripts_ps/backup-db.sh
```

Crea 3 archivos JSON en `db_backups/`:

-   `backup_YYYYMMDD_HHMMSS_users.json`
-   `backup_YYYYMMDD_HHMMSS_parkingspots.json`
-   `backup_YYYYMMDD_HHMMSS_reservations.json`

### Restaurar Backup

**Windows:**

```powershell
.\scripts_ps\restore-db.ps1
```

**Linux/Mac:**

```bash
./scripts_ps/restore-db.sh
```

El script muestra backups disponibles y permite elegir cuál restaurar.

### Flujo Multi-PC

**PC Casa (viernes):**

```bash
# Hacer cambios...
.\scripts_ps\backup-db.ps1
git add .
git commit -m "Avances + backup BD"
git push
```

**PC Instituto (lunes):**

```bash
git pull
docker-compose up -d
.\scripts_ps\restore-db.ps1  # Seleccionar backup más reciente
```

---

## Usuarios de Prueba

### Admin

-   **Email:** admin@iestacio.gva.es
-   **Password:** admin123
-   **Permisos:** Gestión completa del sistema

### Usuarios Normales

Todos con password: `user123`

-   voro.moran@iestacio.gva.es
-   xavi.smx@iestacio.gva.es
-   jairo.smx@iestacio.gva.es
-   jordi.smx@iestacio.gva.es
-   miqui.profe@iestacio.gva.es

---

## Seguridad

### Autenticación JWT

-   Tokens con expiración de 24h
-   Almacenados en localStorage del navegador
-   Enviados en header `Authorization: Bearer <token>`

### Contraseñas

-   Hash con bcrypt (10 rounds)
-   Nunca se almacenan en texto plano
-   Método `comparePassword()` para verificación

### Middleware de Protección

```javascript
// Verificar token válido
verifyToken(req, res, next);

// Verificar rol de admin
verifyAdmin(req, res, next);
```

### Autorización

-   Usuarios solo pueden ver/cancelar sus propias reservas
-   Solo admins pueden gestionar plazas y ver todas las reservas
-   El `userId` se extrae del token JWT (no puede falsificarse)

### Variables de Entorno

Secretos en archivo `.env`:

-   `JWT_SECRET` - Clave para firmar tokens
-   `MONGO_URI` - Conexión a base de datos

**NOTA:** En este proyecto educativo el `.env` está en Git. En producción real, NUNCA subir `.env` a Git.

---

## Scripts Disponibles

### Windows (PowerShell)

| Script                        | Descripción                            |
| ----------------------------- | -------------------------------------- |
| `.\scripts_ps\start.ps1`      | Inicia todo el sistema automáticamente |
| `.\scripts_ps\backup-db.ps1`  | Exporta la base de datos a JSON        |
| `.\scripts_ps\restore-db.ps1` | Restaura desde backup                  |

### Linux/Mac (Bash)

| Script                       | Descripción                            |
| ---------------------------- | -------------------------------------- |
| `./scripts_ps/start.sh`      | Inicia todo el sistema automáticamente |
| `./scripts_ps/backup-db.sh`  | Exporta la base de datos a JSON        |
| `./scripts_ps/restore-db.sh` | Restaura desde backup                  |

### Docker

| Comando                          | Descripción                             |
| -------------------------------- | --------------------------------------- |
| `docker-compose up -d`           | Levantar servicios                      |
| `docker-compose down`            | Detener servicios                       |
| `docker-compose down -v`         | Detener y eliminar volúmenes (borra BD) |
| `docker-compose logs -f`         | Ver logs en tiempo real                 |
| `docker-compose restart backend` | Reiniciar solo el backend               |

---

## Puertos Utilizados

| Servicio | Puerto | URL                       |
| -------- | ------ | ------------------------- |
| Frontend | 8080   | http://localhost:8080     |
| Backend  | 3010   | http://localhost:3010     |
| MongoDB  | 27017  | mongodb://localhost:27017 |

---

## Comandos Útiles

### Ver logs del backend

```bash
docker-compose logs -f backend
```

### Reiniciar servicios

```bash
docker-compose restart
```

### Limpiar todo y empezar de cero

```bash
docker-compose down -v
.\scripts_ps\start.ps1
```

### Acceder a MongoDB

```bash
docker exec -it plaza_coche_mongodb mongosh
use plaza_coche
db.users.find()
```

---

## Solución de Problemas

### Puerto 3010 ocupado

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3010

# Detener contenedores previos
docker-compose down
```

### No aparecen datos

```bash
# Restaurar desde backup
.\scripts_ps\restore-db.ps1
```

### Error de CORS

-   Verificar que el backend esté en puerto 3010
-   Verificar que ApiService.js apunte a http://localhost:3010

---

## Desarrollo

### Agregar nueva funcionalidad

1. **Backend:** Crear ruta en `routes/`
2. **Frontend:** Agregar método en `ApiService.js`
3. **UI:** Actualizar HTML/JS correspondiente

### Hacer cambios en el código

El backend se reinicia automáticamente con cambios (volumen montado).
Para el frontend, solo recarga el navegador.

---

## Funcionalidades

### Admin
- Ver todas las plazas (3 plazas fijas: A-01, B-01, C-01)
- Crear nuevas plazas
- Activar/Desactivar plazas con toggle ON/OFF
- Asignar plazas a usuarios registrados
- Liberar plazas asignadas
- Ver todos los usuarios

### Usuario
- Ver su horario semanal
- Introducir y guardar horario semanal (lunes-viernes, 8-22h)
- Ver plazas disponibles (solo las activas)

---

## Asignación de Plazas por Admin

### Descripción

El admin puede asignar plazas de estacionamiento a usuarios registrados. Una plaza asignada se marca como no disponible para otros usuarios.

### Flujo

1. Admin accede a tab "Plazas"
2. Ve tabla con todas las plazas y sus estados
3. Clickea botón "Asignar" en la plaza deseada
4. Se abre modal con dropdown de usuarios
5. Admin selecciona usuario y confirma
6. Plaza se marca como no disponible (asignada)
7. Si necesita liberar, clickea "Liberar" y plaza vuelve a disponible

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/assign-plaza/:plazaId/user/:userId` | Asignar plaza a usuario |
| POST | `/api/admin/unassign-plaza/:plazaId` | Liberar plaza |

### Interfaz

- Botón "Asignar" en cada plaza disponible
- Botón "Liberar" solo en plazas no disponibles (asignadas)
- Modal con lista de usuarios para seleccionar

---

## Horario Semanal del Usuario

### Descripción

Cada usuario puede introducir su horario de trabajo disponible. El sistema permite marcar las horas de lunes a viernes (8-22h) haciendo click en una tabla interactiva. El horario se guarda por mes y año.

### Estructura de Datos

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  horarios: [
    {
      dia: 'lunes',
      horas: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
    },
    ...
  ],
  mes: 10,
  año: 2025,
  createdAt: Date
}
```

### Flujo de Usuario

1. Usuario clickea botón "Introducir Horario"
2. Se abre modal con tabla interactiva (lunes-viernes × horas 8-22)
3. Usuario clickea las horas que trabaja (se ponen verdes)
4. Clickea "Guardar Horario"
5. Sistema guarda en BD
6. Se muestra tabla resumen del horario guardado

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/user/schedule` | Guardar horario semanal |
| GET | `/api/user/schedule` | Obtener horario actual (mes/año) |

### Interfaz

- Tabla de horario clickeable: 5 columnas (días) × 14 filas (horas)
- Estilos: Celdas blancas por defecto, verdes cuando seleccionadas
- Responsive en móviles

---

## Asignación Automática de Cargador

### Descripción General

El sistema implementa una asignación **equitativa y automática** de horas de cargador cada lunes a las 00:00 (medianoche). El objetivo es que todos los usuarios tengan la oportunidad de usar el cargador de forma justa, priorizando a quienes usaron menos la semana anterior.

### ¿Cómo Funciona el Cron Job?

#### Archivo Principal
`backend/jobs/chargerAssignment.js`

#### Configuración del Schedule
```javascript
// Ejecutar cada lunes a las 00:00 (medianoche)
cron.schedule('0 0 0 * * 1', () => {
    console.log('Ejecutando asignación automática de cargador (cada lunes)');
    autoAssignCharger();
});
```

**Desglose del formato cron:** `0 0 0 * * 1`
- `0` = segundo 0
- `0` = minuto 0  
- `0` = hora 0 (medianoche UTC)
- `*` = cualquier día del mes (flexible)
- `*` = cualquier mes (flexible)
- `1` = día 1 de la semana (lunes)

**Resultado:** La función `autoAssignCharger()` se ejecuta automáticamente cada lunes a las 00:00.

### Algoritmo de Asignación (Paso a Paso)

#### Paso 1: Obtener Uso de la Semana Anterior
```javascript
const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
const semanaAnterior = getWeekNumber(hace7Dias);

const usosSemanaPasada = {};
for (const usuario of usuarios) {
    const uso = await WeeklyUsage.findOne({
        userId: usuario._id,
        semana: semanaAnterior,
    });
    usosSemanaPasada[usuario._id] = uso ? uso.horasUtilizadas : 0;
}
```
**Qué hace:** 
- Calcula la fecha de hace 7 días
- Busca el número de semana anterior
- Para cada usuario, obtiene cuántas horas usó esa semana
- Si no tiene registro, asume 0 horas

**Ejemplo:**
```
Usuario A: 10 horas
Usuario B: 2 horas
Usuario C: 15 horas
Usuario D: 5 horas
Usuario E: 8 horas
```

#### Paso 2: Ordenar Usuarios (Menor a Mayor)
```javascript
const usuariosOrdenados = usuarios.sort((a, b) => {
    return usosSemanaPasada[a._id] - usosSemanaPasada[b._id];
});
```
**Qué hace:** Ordena los usuarios de menor a mayor uso

**Resultado del ejemplo anterior:**
```
1º Usuario B: 2 horas  ← Primera prioridad
2º Usuario D: 5 horas
3º Usuario E: 8 horas
4º Usuario A: 10 horas
5º Usuario C: 15 horas ← Última prioridad
```

#### Paso 3: Obtener Horario de Cada Usuario
```javascript
const schedule = await Schedule.findOne({
    userId: usuario._id,
    mes: mes,
    año: año,
});

if (!schedule) {
    continue; // No asignar si no tiene horario
}
```
**Qué hace:** 
- Busca el horario mensual del usuario
- Si no tiene horario registrado, lo salta
- Esto asegura que solo usuarios activos reciban asignación

#### Paso 4: Calcular Horas Disponibles
```javascript
const horasPorDia = {};
dias.forEach(dia => {
    horasPorDia[dia] = 0;
});

schedule.horarios.forEach(item => {
    if (item.horas && item.horas.length > 0) {
        // Limitar a máximo 2 horas por día
        horasPorDia[item.dia] = Math.min(item.horas.length, 2);
    }
});
```
**Qué hace:**
- Recorre el horario de cada usuario
- Cuenta cuántas horas tiene disponibles por día
- **Limita a máximo 2 horas por día** (protección contra sobreasignación)

**Ejemplo:**
```
Usuario tiene: Lunes [8,9,10,11,12,13,15,16] (8 horas)
Se asigna:    Máximo 2 horas (8:00-9:00 ó 9:00-10:00)
Resultado:    horasPorDia['lunes'] = 2
```

#### Paso 5: Crear Registro de Uso Semanal
```javascript
const detalleHoras = [];
let totalHoras = 0;

dias.forEach(dia => {
    const horas = horasPorDia[dia];
    detalleHoras.push({
        dia: dia,
        horas: horas,
    });
    totalHoras += horas;
});

const weeklyUsage = new WeeklyUsage({
    userId: usuario._id,
    semana: semanaActual,
    horasUtilizadas: totalHoras,
    detalleHoras: detalleHoras,
});

await weeklyUsage.save();
```
**Qué hace:**
- Crea array con detalleHoras (horas por día)
- Calcula totalHoras (suma de todos los días)
- Guarda en BD para que usuario lo vea

**Ejemplo de resultado:**
```json
{
  "userId": "123abc",
  "semana": "2025-43",
  "horasUtilizadas": 8,
  "detalleHoras": [
    { "dia": "lunes", "horas": 2 },
    { "dia": "martes", "horas": 2 },
    { "dia": "miercoles", "horas": 2 },
    { "dia": "jueves", "horas": 1 },
    { "dia": "viernes", "horas": 1 }
  ]
}
```

### Ejemplo Completo de Ejecución

**Contexto:**
- Lunes 27 de octubre 2025, 00:00 (medianoche)
- 5 usuarios en el sistema

**Datos de semana anterior (20-26 octubre):**
```
Juan:   10 horas usadas
María:  2 horas usadas
Pedro:  15 horas usadas
Laura:  5 horas usadas
Carlos: 8 horas usadas
```

**Orden de prioridad (menor a mayor):**
```
1º María (2h)   → Asignar primero
2º Laura (5h)
3º Carlos (8h)
4º Juan (10h)
5º Pedro (15h)  → Asignar último
```

**Horarios de cada usuario (aproximado):**
```
María:   8-10 (2h disponibles)
Laura:   8-12 (4h disponibles)
Carlos:  9-12 (3h disponibles)
Juan:    8-22 (14h disponibles)
Pedro:   8-22 (14h disponibles)
```

**Asignación de esta semana (27 oct - 2 nov):**
```
María:   2 horas (8:00-10:00 lunes-martes)
Laura:   4 horas (8:00-12:00 distribuido)
Carlos:  2 horas (máximo 2 por día)
Juan:    2 horas (máximo 2 por día)
Pedro:   2 horas (máximo 2 por día)
```

### Ventajas del Algoritmo

✅ **Equitativo:** Prioriza a quienes menos usaron
✅ **Automático:** Sin intervención manual del admin
✅ **Seguro:** Límite de 2h/día evita monopolios
✅ **Flexible:** Se adapta al horario de cada usuario
✅ **Justo:** Todos tienen oportunidad cada semana

### Cómo ve el Usuario la Asignación

El usuario accede a la **primera pestaña** "Asignación Esta Semana" y ve:

```
Te tocan 8 horas esta semana

Distribuido por días:
Lunes:    2h (8:00 - 10:00)
Martes:   2h (8:00 - 10:00)
Miércoles: 2h (8:00 - 10:00)
Jueves:   1h (8:00 - 9:00)
Viernes:  1h (8:00 - 9:00)
```

---

## Licencia

Proyecto educativo - IES Estació 2024

---

## Contacto

-   Repositorio: https://github.com/voromb/plaza_coche.git
-   Issues: https://github.com/voromb/plaza_coche/issues

---

Desarrollado con patrón Singleton, dockerizado y documentado para uso educativo.
