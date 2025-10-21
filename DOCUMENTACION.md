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

| Método | Endpoint                           | Descripción               |
| ------ | ---------------------------------- | ------------------------- |
| GET    | `/api/user/parking-spots`          | Listar plazas disponibles |
| POST   | `/api/user/reserve`                | Crear reserva             |
| GET    | `/api/user/my-reservations`        | Mis reservas              |
| DELETE | `/api/user/cancel-reservation/:id` | Cancelar reserva          |

### Admin (Requiere JWT + rol admin)

| Método | Endpoint                      | Descripción        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/api/admin/parking-spots`    | Todas las plazas   |
| POST   | `/api/admin/parking-spot`     | Crear plaza        |
| PUT    | `/api/admin/parking-spot/:id` | Actualizar plaza   |
| DELETE | `/api/admin/parking-spot/:id` | Eliminar plaza     |
| GET    | `/api/admin/all-reservations` | Todas las reservas |
| GET    | `/api/admin/users`            | Todos los usuarios |

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

## Licencia

Proyecto educativo - IES Estació 2024

---

## Contacto

-   Repositorio: https://github.com/voromb/plaza_coche.git
-   Issues: https://github.com/voromb/plaza_coche/issues

---

Desarrollado con patrón Singleton, dockerizado y documentado para uso educativo.
