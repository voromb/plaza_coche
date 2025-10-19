# 🏗️ Arquitectura del Sistema - Plaza Coche

## Visión General

Sistema web para gestionar el alquiler de plazas de estacionamiento del instituto, construido con:

-   **Frontend**: JavaScript Vanilla con patrón Singleton
-   **Backend**: Node.js + Express
-   **Base de Datos**: MongoDB
-   **Contenedores**: Docker + Docker Compose

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                   │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐       │
│  │ index.html │  │ user.html  │  │ admin.html   │       │
│  └────────────┘  └────────────┘  └──────────────┘       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │           JavaScript (Singletons)                │   │
│  │  • AuthService (Autenticación)                   │   │
│  │  • ApiService (Comunicación con Backend)         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP/JSON
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                    Routes                        │   │
│  │  /api/auth  │    /api/user  │    /api/admin      │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Middleware                      │   │
│  │  • JWT Verification                              │   │
│  │  • Admin Authorization                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │                   Models                         │   │
│  │  User │ ParkingSpot │ Reservation                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓ Mongoose
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                     │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  users   │  │parkingspots  │  │ reservations │       │
│  └──────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## Patrón Singleton

El sistema utiliza el **patrón Singleton** para garantizar una única instancia de servicios críticos:

### Frontend Singletons

#### 1. AuthService (Gestión de Autenticación)

```javascript
class AuthService {
    static instance = null;

    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
}
```

**Responsabilidades:**

-   Gestionar login/logout
-   Almacenar y recuperar token JWT
-   Verificar permisos de usuario
-   Proteger rutas según rol

#### 2. ApiService (Comunicación con Backend)

```javascript
class ApiService {
    static instance = null;

    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }
}
```

**Responsabilidades:**

-   Centralizar todas las llamadas HTTP
-   Gestionar headers (Authorization, Content-Type)
-   Manejar errores de red
-   Proporcionar métodos para cada endpoint

### Backend Singleton

#### Database Connection (Conexión a MongoDB)

```javascript
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }
        Database.instance = this;
        this.connect();
    }
}
```

**Responsabilidades:**

-   Mantener una única conexión a MongoDB
-   Gestionar reconexiones automáticas
-   Proporcionar la instancia de conexión

---

## Flujo de Datos

### Flujo de Autenticación (Login)

```
1. Usuario → index.html
   └─ Ingresa credenciales

2. Frontend → AuthService.login()
   └─ Valida campos

3. AuthService → ApiService.login()
   └─ Prepara petición HTTP

4. ApiService → Backend /api/auth/login
   └─ POST con { email, password }

5. Backend → User.findOne()
   └─ Busca usuario en MongoDB

6. Backend → user.comparePassword()
   └─ Verifica hash bcrypt

7. Backend → jwt.sign()
   └─ Genera token JWT

8. Backend → Frontend
   └─ Responde { token, user }

9. AuthService → localStorage
   └─ Guarda token y user

10. Frontend → Redirección
    └─ admin.html o user.html según rol
```

### Flujo de Reserva (Usuario)

```
1. user.html → Cargar plazas disponibles
   └─ apiService.getParkingSpots()

2. Backend → GET /api/user/parking-spots
   └─ Middleware verifyToken()
   └─ ParkingSpot.find({ disponible: true })

3. Usuario → Click "Reservar"
   └─ Abre modal con fechas

4. Usuario → Submit formulario
   └─ apiService.createReservation()

5. Backend → POST /api/user/reserve
   └─ Verifica disponibilidad
   └─ Crea Reservation
   └─ Actualiza ParkingSpot.disponible = false

6. Frontend → Actualiza UI
   └─ Recarga plazas y reservas
```

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
  role: Enum ['user', 'admin'],
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
  estado: Enum ['activa', 'completada', 'cancelada'],
  createdAt: Date
}
```

---

## Seguridad

### Autenticación

-   **JWT (JSON Web Tokens)**: Token firmado con HS256
-   **Bcrypt**: Hash de contraseñas con salt rounds = 10
-   **Token en Header**: `Authorization: Bearer <token>`
-   **Expiración**: 24 horas

### Autorización

-   **Middleware verifyToken**: Verifica JWT en todas las rutas protegidas
-   **Middleware verifyAdmin**: Verifica rol de admin en rutas admin
-   **Frontend**: AuthService protege rutas según rol

### Mejores Prácticas Implementadas

-   ✅ Contraseñas nunca se envían en respuestas
-   ✅ Tokens almacenados en localStorage (HTTPS en producción)
-   ✅ Validación de permisos en backend y frontend
-   ✅ CORS configurado para permitir solo orígenes conocidos

---

## Endpoints API

### Auth (`/api/auth`)

| Método | Ruta      | Descripción       | Auth |
| ------ | --------- | ----------------- | ---- |
| POST   | /register | Registrar usuario | No   |
| POST   | /login    | Iniciar sesión    | No   |

### User (`/api/user`)

| Método | Ruta                    | Descripción            | Auth |
| ------ | ----------------------- | ---------------------- | ---- |
| GET    | /parking-spots          | Ver plazas disponibles | Sí   |
| POST   | /reserve                | Crear reserva          | Sí   |
| GET    | /my-reservations        | Ver mis reservas       | Sí   |
| DELETE | /cancel-reservation/:id | Cancelar reserva       | Sí   |

### Admin (`/api/admin`)

| Método | Ruta              | Descripción            | Auth  |
| ------ | ----------------- | ---------------------- | ----- |
| GET    | /all-reservations | Ver todas las reservas | Admin |
| GET    | /parking-spots    | Ver todas las plazas   | Admin |
| POST   | /parking-spot     | Crear plaza            | Admin |
| PUT    | /parking-spot/:id | Actualizar plaza       | Admin |
| DELETE | /parking-spot/:id | Eliminar plaza         | Admin |
| GET    | /users            | Ver todos los usuarios | Admin |

---

## Escalabilidad

### Mejoras Futuras

1. **Backend**

    - Implementar Redis para caché
    - Rate limiting
    - Paginación en listados
    - WebSockets para actualizaciones en tiempo real

2. **Frontend**

    - Service Workers para PWA
    - Caché de datos
    - Optimización de imágenes

3. **Base de Datos**

    - Índices en campos frecuentes
    - Replica sets para alta disponibilidad
    - Backup automatizado

4. **DevOps**
    - CI/CD con GitHub Actions
    - Monitoreo con Prometheus
    - Logs centralizados
    - HTTPS con Let's Encrypt

---

## Tecnologías Utilizadas

| Categoría         | Tecnología     | Versión |
| ----------------- | -------------- | ------- |
| Runtime           | Node.js        | 18+     |
| Backend Framework | Express        | 4.18    |
| Base de Datos     | MongoDB        | Latest  |
| ODM               | Mongoose       | 7.0     |
| Autenticación     | JWT            | 9.0     |
| Encriptación      | Bcryptjs       | 2.4     |
| Contenedores      | Docker         | Latest  |
| Orquestación      | Docker Compose | 3.8     |
| Frontend          | Vanilla JS     | ES6+    |
| Servidor Web      | Nginx          | Alpine  |
