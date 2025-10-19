# 🚗 Plaza Coche - Proyecto Completo

## 📋 Resumen del Proyecto

Sistema web completo para gestionar el alquiler de plazas de estacionamiento del IES Estació, desarrollado como proyecto educativo con arquitectura Singleton.

---

## ✅ Características Implementadas

### 🎨 Frontend (JavaScript Vanilla)

-   ✅ Patrón Singleton (ApiService, AuthService)
-   ✅ 3 páginas HTML (login, user, admin)
-   ✅ Diseño responsive y moderno
-   ✅ Gestión de sesión con JWT
-   ✅ Protección de rutas por rol

### ⚙️ Backend (Node.js + Express)

-   ✅ API RESTful con 14 endpoints
-   ✅ Patrón Singleton (Database connection)
-   ✅ Autenticación JWT
-   ✅ Middleware de autorización
-   ✅ 3 modelos de datos (User, ParkingSpot, Reservation)
-   ✅ Hash de contraseñas con bcrypt

### 🗄️ Base de Datos (MongoDB)

-   ✅ 3 colecciones con referencias
-   ✅ Sistema de backup/restore (JSON)
-   ✅ Scripts de inicialización
-   ✅ Datos de prueba incluidos

### 🐳 Dockerización

-   ✅ 3 contenedores (MongoDB, Backend, Frontend)
-   ✅ Docker Compose configurado
-   ✅ Variables de entorno (.env)
-   ✅ Nginx para servir frontend

### 🔒 Seguridad

-   ✅ JWT con expiración 24h
-   ✅ Contraseñas hasheadas (bcrypt)
-   ✅ Middleware de autenticación
-   ✅ Verificación de roles
-   ✅ Variables de entorno para secretos

---

## 📁 Estructura del Proyecto (Completa)

```
plaza_coche/
│
├── 📚 DOCUMENTACIÓN (7 archivos)
│   ├── README.md                    Documentación principal
│   ├── QUICKSTART.md               Inicio rápido
│   ├── INSTALL.md                  Instalación detallada
│   ├── ARQUITECTURA.md             Documentación técnica
│   ├── ESTRUCTURA.md               Estructura del código
│   ├── SEGURIDAD.md                Guía de seguridad
│   ├── DB_BACKUP_GUIDE.md          Guía de backups
│   └── PROYECTO_COMPLETO.md        Este archivo
│
├── 🔧 scripts_ps/ (8 archivos)
│   ├── start.ps1                   Inicio automático
│   ├── init-db.ps1                 Inicializar datos
│   ├── backup-db.ps1               Exportar BD a JSON
│   ├── restore-db.ps1              Importar desde JSON
│   ├── setup-env.ps1               Configurar .env
│   ├── start.sh                    Inicio automático (Linux/Mac)
│   ├── init-db.sh                  Inicializar datos
│   └── setup-env.sh                Configurar .env
│
├── ⚙️ CONFIGURACIÓN (5 archivos)
│   ├── .env                        Variables de entorno
│   ├── .env.example                Plantilla de .env
│   ├── .gitignore                  Archivos ignorados
│   ├── docker-compose.yml          Orquestación Docker
│   └── Dockerfile (backend)        Imagen backend
│
├── 🖥️ BACKEND (14 archivos)
│   ├── server.js                   Punto de entrada
│   ├── package.json                Dependencias
│   │
│   ├── config/
│   │   └── db.js                   Singleton MongoDB
│   │
│   ├── models/
│   │   ├── User.js                 Modelo Usuario
│   │   ├── ParkingSpot.js          Modelo Plaza
│   │   └── Reservation.js          Modelo Reserva
│   │
│   ├── routes/
│   │   ├── auth.js                 Login/Register (2 endpoints)
│   │   ├── user.js                 Rutas usuario (4 endpoints)
│   │   └── admin.js                Rutas admin (6 endpoints)
│   │
│   ├── middleware/
│   │   └── auth.js                 Verificación JWT + Admin
│   │
│   └── scripts/
│       ├── init-data.js            Script de inicialización BD
│       └── README.md               Documentación
│
├── 🎨 FRONTEND (8 archivos)
│   ├── index.html                  Login/Registro
│   ├── user.html                   Dashboard Usuario
│   ├── admin.html                  Dashboard Admin
│   │
│   ├── css/
│   │   └── style.css               Estilos completos
│   │
│   └── js/
│       ├── ApiService.js           Singleton API (118 líneas)
│       ├── AuthService.js          Singleton Auth
│       ├── user.js                 Controller Usuario
│       └── admin.js                Controller Admin
│
├── 📦 BACKUPS
│   └── db_backups/
│       └── README.md               Guía de backups
│
└── 📜 SCRIPTS DE INICIALIZACIÓN
    └── scripts/
        ├── init-data.js            Crear datos de prueba
        └── README.md               Documentación scripts

TOTAL: ~50 archivos | ~2500 líneas de código
```

---

## 🔄 Scripts Disponibles

### Windows (PowerShell)

| Script                        | Descripción            | Uso                     |
| ----------------------------- | ---------------------- | ----------------------- |
| `.\scripts_ps\start.ps1`      | Inicia todo el sistema | Primera vez / reiniciar |
| `.\scripts_ps\init-db.ps1`    | Datos de prueba        | Después de `start.ps1`  |
| `.\scripts_ps\backup-db.ps1`  | Exporta BD a JSON      | Antes de push a Git     |
| `.\scripts_ps\restore-db.ps1` | Restaura desde JSON    | Después de pull de Git  |
| `.\scripts_ps\setup-env.ps1`  | Crea archivos .env     | Solo si es necesario    |

### Linux/Mac (Bash)

| Script                      | Descripción            |
| --------------------------- | ---------------------- |
| `./scripts_ps/start.sh`     | Inicia todo el sistema |
| `./scripts_ps/init-db.sh`   | Datos de prueba        |
| `./scripts_ps/setup-env.sh` | Crea archivos .env     |

---

## 🎯 Flujos de Trabajo

### 🚀 Primera Vez (PC Nuevo)

```powershell
# 1. Clonar repositorio
git clone https://github.com/voromb/plaza_coche.git
cd plaza_coche

# 2. Iniciar sistema (hace todo automáticamente)
.\scripts_ps\start.ps1

# Eso es todo! Se abre el navegador automáticamente
```

**El script `start.ps1` hace:**

1. Verifica Docker
2. Detiene contenedores previos
3. Construye e inicia servicios
4. Espera 15 segundos
5. Inicializa datos de prueba
6. Abre navegador en http://localhost:8080

---

### 💼 Trabajo Diario (Un Solo PC)

```powershell
# Inicio del día
.\scripts_ps\start.ps1

# ... trabajar en el proyecto ...

# Fin del día
docker-compose down
git add .
git commit -m "Trabajo del día"
git push
```

---

### 🏫 Trabajo en Múltiples PCs (Casa + Instituto)

#### PC Casa (viernes)

```powershell
# 1. Trabajar normalmente
.\scripts_ps\start.ps1
# ... hacer cambios, crear reservas, etc ...

# 2. Antes de terminar - HACER BACKUP
.\scripts_ps\backup-db.ps1

# 3. Subir a Git
git add .
git commit -m "Avances viernes + backup BD"
git push
```

#### PC Instituto (lunes)

```powershell
# 1. Actualizar código
git pull

# 2. Iniciar Docker
docker-compose up -d

# 3. RESTAURAR datos del viernes
.\scripts_ps\restore-db.ps1
# Seleccionar el backup más reciente [0]

# 4. ¡Continuar trabajando con tus datos!
start http://localhost:8080
```

---

## 👥 Usuarios de Prueba

| Rol         | Email                 | Contraseña | Permisos              |
| ----------- | --------------------- | ---------- | --------------------- |
| **Admin**   | admin@iestacio.gva.es | admin123   | Gestión completa      |
| **Usuario** | user@iestacio.gva.es  | user123    | Ver y reservar plazas |

---

## 📡 Endpoints API (14 total)

### Auth (2 endpoints - Públicos)

-   `POST /api/auth/register` - Registrar usuario
-   `POST /api/auth/login` - Iniciar sesión

### User (4 endpoints - Requiere autenticación)

-   `GET /api/user/parking-spots` - Ver plazas disponibles
-   `POST /api/user/reserve` - Reservar plaza
-   `GET /api/user/my-reservations` - Mis reservas
-   `DELETE /api/user/cancel-reservation/:id` - Cancelar reserva

### Admin (6 endpoints - Requiere rol admin)

-   `GET /api/admin/parking-spots` - Todas las plazas
-   `POST /api/admin/parking-spot` - Crear plaza
-   `PUT /api/admin/parking-spot/:id` - Actualizar plaza
-   `DELETE /api/admin/parking-spot/:id` - Eliminar plaza
-   `GET /api/admin/all-reservations` - Todas las reservas
-   `GET /api/admin/users` - Todos los usuarios

---

## 🗄️ Modelos de Datos

### User (Usuarios)

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

### ParkingSpot (Plazas)

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

### Reservation (Reservas)

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

## 🔌 Puertos Utilizados

| Servicio | Puerto | URL                       |
| -------- | ------ | ------------------------- |
| Frontend | 8080   | http://localhost:8080     |
| Backend  | 3000   | http://localhost:3000     |
| MongoDB  | 27017  | mongodb://localhost:27017 |

---

## 📊 Tecnologías Utilizadas

### Frontend

-   HTML5, CSS3
-   JavaScript ES6+ (Vanilla)
-   Fetch API
-   LocalStorage para JWT
-   **Patrón:** Singleton

### Backend

-   Node.js 18+
-   Express 4.18
-   Mongoose 7.0
-   JWT (jsonwebtoken 9.0)
-   Bcrypt 2.4
-   CORS
-   **Patrón:** Singleton

### Base de Datos

-   MongoDB (latest)
-   Formato JSON para backups

### DevOps

-   Docker
-   Docker Compose 3.8
-   Nginx (Alpine)

---

## ✨ Características Destacadas

### 🎯 Patrón Singleton Implementado

**Frontend:**

-   `ApiService` - Una sola instancia para todas las llamadas HTTP
-   `AuthService` - Una sola instancia para gestión de sesión

**Backend:**

-   `Database` - Una sola conexión a MongoDB

### 🔒 Seguridad

-   JWT con expiración (24h)
-   Passwords hasheados con bcrypt (10 rounds)
-   Middleware de autenticación en todas las rutas protegidas
-   Verificación de roles (admin vs user)
-   Variables de entorno para secretos
-   CORS configurado

### 📦 Sistema de Backup

-   Exportación a JSON (legible y editable)
-   Compatible con Git
-   Portabilidad entre PCs
-   Scripts automatizados
-   Documentación completa

---

## 🎓 Aprendizaje

Este proyecto demuestra:

✅ Arquitectura limpia y escalable  
✅ Patrón Singleton correctamente implementado  
✅ Separación de responsabilidades  
✅ API RESTful bien estructurada  
✅ Dockerización completa  
✅ Sistema de autenticación robusto  
✅ Gestión de estado en frontend  
✅ Base de datos NoSQL con relaciones  
✅ Sistema de backup/restore  
✅ Documentación exhaustiva

---

## 🚀 Próximos Pasos Posibles

### Mejoras Funcionales

-   [ ] Historial de reservas
-   [ ] Notificaciones por email
-   [ ] Calendario de disponibilidad
-   [ ] Valoraciones de plazas
-   [ ] Sistema de búsqueda avanzada

### Mejoras Técnicas

-   [ ] Tests unitarios (Jest)
-   [ ] Tests E2E (Cypress)
-   [ ] CI/CD (GitHub Actions)
-   [ ] Rate limiting
-   [ ] Helmet.js para seguridad
-   [ ] Logging con Winston
-   [ ] Refresh tokens
-   [ ] WebSockets para tiempo real

### Mejoras de UI/UX

-   [ ] PWA (Progressive Web App)
-   [ ] Dark mode
-   [ ] Internacionalización (i18n)
-   [ ] Animaciones
-   [ ] Feedback visual mejorado

---

## 📚 Documentación del Proyecto

| Archivo                | Descripción            | Para             |
| ---------------------- | ---------------------- | ---------------- |
| `README.md`            | Visión general         | Todos            |
| `QUICKSTART.md`        | Inicio rápido          | Primeros pasos   |
| `INSTALL.md`           | Instalación detallada  | Configuración    |
| `ARQUITECTURA.md`      | Arquitectura técnica   | Desarrollo       |
| `ESTRUCTURA.md`        | Estructura de archivos | Navegación       |
| `SEGURIDAD.md`         | Guía de seguridad      | Producción       |
| `DB_BACKUP_GUIDE.md`   | Sistema de backups     | Multi-PC         |
| `PROYECTO_COMPLETO.md` | Este archivo           | Resumen completo |

---

## 🎯 Comandos Más Usados

```powershell
# Iniciar proyecto
.\scripts_ps\start.ps1

# Hacer backup
.\scripts_ps\backup-db.ps1

# Restaurar backup
.\scripts_ps\restore-db.ps1

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down

# Limpiar todo (incluye BD)
docker-compose down -v

# Reiniciar backend
docker-compose restart backend
```

---

## 📞 Soporte

-   **Repositorio:** https://github.com/voromb/plaza_coche.git
-   **Issues:** https://github.com/voromb/plaza_coche/issues
-   **Email:** contacto@iestacio.gva.es

---

## 📝 Licencia

Proyecto educativo - IES Estació 2024

---

**¡Proyecto completado al 100%!** 🎉🚗🅿️

_Desarrollado con patrón Singleton, dockerizado y documentado completamente para uso educativo._
