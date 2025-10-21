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

### Descripción

El sistema asigna automáticamente horas de cargador cada lunes a las 00:00 de forma equitativa entre todos los usuarios, priorizando a quienes usaron menos horas la semana anterior.

### Algoritmo

1. Cada lunes a medianoche se ejecuta el cron job
2. Busca cuántas horas usó cada usuario la semana anterior
3. Ordena usuarios por horas de menor a mayor
4. Asigna horas basadas en el horario disponible de cada usuario
5. Máximo 2 horas por día laboral (lunes-viernes)
6. Las horas se distribuyen equitativamente

### Archivo de Configuración

`backend/jobs/chargerAssignment.js`

```javascript
// Programar job cada lunes a las 00:00
cron.schedule('0 0 0 * * 1', () => {
    autoAssignCharger();
});
```

### Flujo

1. El backend inicia con el cron job
2. Cada lunes obtiene uso de semana anterior
3. Consulta horarios de cada usuario
4. Calcula horas disponibles
5. Crea registros de `WeeklyUsage` para esta semana
6. Usuario ve asignación en primera pestaña

### Endpoints Relacionados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/auto-assign-charger` | Ejecutar asignación manual |
| GET | `/api/user/weekly-usage` | Obtener asignación de esta semana |

---

## Sistema de Pestañas

### Descripción

El panel de usuario ahora organiza la información en 3 pestañas para mejor experiencia:

### Estructura

**Pestaña 1: Asignación Esta Semana**
- Muestra horas totales asignadas
- Distribuido por días (Lunes-Viernes)
- Rango horario específico (ej: 8:00-10:00)
- Se calcula automáticamente cada lunes

**Pestaña 2: Mi Horario**
- Horario semanal registrado por el usuario
- Tabla con días y horas disponibles
- Botón para modificar horario (solo si aún no tiene uno)
- Una vez guardado, solo admin puede cambiar

**Pestaña 3: Uso del Cargador**
- Historial de uso semanal
- Barra de progreso visual
- Detalleado por día
- Máximo 40 horas por semana (8h × 5 días)

### Implementación

En `frontend/user.html`:
```html
<div class="tabs">
    <button class="tab-btn active" data-tab="asignacion">Asignación Esta Semana</button>
    <button class="tab-btn" data-tab="horario">Mi Horario</button>
    <button class="tab-btn" data-tab="uso">Uso del Cargador</button>
</div>
```

En `frontend/js/user.js`:
- Función `initTabs()` maneja cambio de pestañas
- Cargar datos específicos según pestaña activa
- Estilos en CSS para activación de pestañas

---

## Licencia

Proyecto educativo - IES Estació 2024

---

## Contacto

-   Repositorio: https://github.com/voromb/plaza_coche.git
-   Issues: https://github.com/voromb/plaza_coche/issues

---

Desarrollado con patrón Singleton, dockerizado y documentado para uso educativo.
