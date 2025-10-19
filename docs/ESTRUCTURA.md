# 📂 Estructura del Proyecto

```
plaza_coche/
│
├── 📄 README.md                    # Documentación principal
├── 📄 QUICKSTART.md               # Guía de inicio rápido
├── 📄 INSTALL.md                  # Guía de instalación detallada
├── 📄 ARQUITECTURA.md             # Documentación de arquitectura
├── 📄 CONTRIBUTING.md             # Guía para contribuir
├── 📄 .gitignore                  # Archivos ignorados por Git
├── 🐳 docker-compose.yml          # Orquestación de contenedores
│
├── 🚀 start.bat                   # Script inicio rápido (Windows)
├── 🚀 start.sh                    # Script inicio rápido (Linux/Mac)
├── 🗄️ init-db.bat                 # Inicializar DB (Windows)
├── 🗄️ init-db.sh                  # Inicializar DB (Linux/Mac)
│
├── 📁 backend/                     # API Express (Node.js)
│   ├── 📄 package.json            # Dependencias Node.js
│   ├── 📄 server.js               # Punto de entrada del servidor
│   ├── 🐳 Dockerfile              # Imagen Docker para backend
│   ├── 📄 .dockerignore           # Archivos ignorados por Docker
│   │
│   ├── 📁 config/
│   │   └── db.js                  # 🔧 Conexión MongoDB (Singleton)
│   │
│   ├── 📁 models/                 # 📊 Modelos de datos (Mongoose)
│   │   ├── User.js                # Modelo de Usuario
│   │   ├── ParkingSpot.js         # Modelo de Plaza
│   │   └── Reservation.js         # Modelo de Reserva
│   │
│   ├── 📁 routes/                 # 🛣️ Endpoints de la API
│   │   ├── auth.js                # Login, Register
│   │   ├── user.js                # Rutas de usuario
│   │   └── admin.js               # Rutas de administrador
│   │
│   └── 📁 middleware/             # 🔒 Middlewares
│       └── auth.js                # JWT verification, Admin check
│
├── 📁 frontend/                    # Interfaz web (HTML/CSS/JS)
│   ├── 📄 index.html              # Página de Login/Registro
│   ├── 📄 user.html               # Dashboard de Usuario
│   ├── 📄 admin.html              # Dashboard de Administrador
│   │
│   ├── 📁 css/
│   │   └── style.css              # 🎨 Estilos globales
│   │
│   └── 📁 js/                     # JavaScript (Vanilla + Singletons)
│       ├── ApiService.js          # 🔧 Singleton - Llamadas API
│       ├── AuthService.js         # 🔧 Singleton - Autenticación
│       ├── user.js                # Lógica página usuario
│       └── admin.js               # Lógica página admin
│
└── 📁 scripts/                     # Scripts de utilidad
    ├── init-data.js               # Inicializar datos de prueba
    └── README.md                  # Documentación de scripts

```

---

## Descripción de Componentes

### Backend (Node.js + Express)

#### 🔧 Config

-   **db.js**: Patrón Singleton para conexión única a MongoDB

#### 📊 Models

-   **User.js**: Esquema de usuario con hash bcrypt
-   **ParkingSpot.js**: Esquema de plaza de estacionamiento
-   **Reservation.js**: Esquema de reserva con referencias

#### 🛣️ Routes

-   **auth.js**: Autenticación (login/register)
-   **user.js**: Operaciones de usuario (ver plazas, reservar)
-   **admin.js**: Operaciones administrativas (CRUD plazas)

#### 🔒 Middleware

-   **auth.js**: Verificación JWT y permisos de admin

### Frontend (Vanilla JavaScript)

#### HTML Pages

-   **index.html**: Login y registro con formularios
-   **user.html**: Dashboard usuario (ver/reservar plazas)
-   **admin.html**: Panel admin con tabs (plazas/reservas/usuarios)

#### JavaScript Singletons

-   **ApiService.js**: Centraliza todas las llamadas HTTP
-   **AuthService.js**: Gestiona autenticación y sesión

#### Controllers

-   **user.js**: Lógica de la página de usuario
-   **admin.js**: Lógica de la página de admin

### Docker

#### docker-compose.yml

Orquesta 3 servicios:

1. **MongoDB**: Base de datos (puerto 27017)
2. **Backend**: API Express (puerto 3000)
3. **Frontend**: Nginx sirviendo HTML/CSS/JS (puerto 8080)

### Scripts

#### init-data.js

Carga datos iniciales:

-   2 usuarios (admin y user)
-   6 plazas de estacionamiento

---

## Flujo de Archivos

### Inicio de Sesión

```
index.html
    ↓
AuthService.js (Singleton)
    ↓
ApiService.js (Singleton)
    ↓
Backend: routes/auth.js
    ↓
Backend: models/User.js
    ↓
MongoDB
```

### Reservar Plaza

```
user.html
    ↓
user.js (Controller)
    ↓
ApiService.js (Singleton)
    ↓
Backend: routes/user.js
    ↓
Backend: middleware/auth.js (verify token)
    ↓
Backend: models/Reservation.js + ParkingSpot.js
    ↓
MongoDB
```

### Gestión Admin

```
admin.html
    ↓
admin.js (Controller)
    ↓
ApiService.js (Singleton)
    ↓
Backend: routes/admin.js
    ↓
Backend: middleware/auth.js (verify token + admin)
    ↓
Backend: models/*
    ↓
MongoDB
```

---

## Tecnologías por Componente

| Componente        | Tecnologías                                   |
| ----------------- | --------------------------------------------- |
| **Backend**       | Node.js, Express, Mongoose, JWT, Bcrypt       |
| **Frontend**      | HTML5, CSS3, JavaScript ES6+ (Vanilla)        |
| **Base de Datos** | MongoDB                                       |
| **Contenedores**  | Docker, Docker Compose                        |
| **Servidor Web**  | Nginx (Alpine)                                |
| **Patrones**      | Singleton (AuthService, ApiService, Database) |

---

## Tamaño del Proyecto

| Tipo                | Cantidad |
| ------------------- | -------- |
| Archivos JavaScript | 9        |
| Archivos HTML       | 3        |
| Archivos CSS        | 1        |
| Modelos de Datos    | 3        |
| Endpoints API       | 14       |
| Líneas de Código    | ~1800    |

---

## Convenciones de Nombres

### Backend

-   **Archivos**: camelCase (auth.js, user.js)
-   **Clases**: PascalCase (User, ParkingSpot)
-   **Funciones**: camelCase (verifyToken, comparePassword)

### Frontend

-   **Archivos**: camelCase o kebab-case
-   **Clases Singleton**: PascalCase (AuthService, ApiService)
-   **Variables**: camelCase
-   **Clases CSS**: kebab-case (auth-box, btn-primary)

---

Este proyecto demuestra:
✅ Arquitectura limpia y escalable
✅ Patrón Singleton correctamente implementado
✅ Separación de responsabilidades
✅ API RESTful bien estructurada
✅ Dockerización completa
✅ Documentación exhaustiva
