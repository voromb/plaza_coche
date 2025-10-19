# 👥 Sistema de Usuarios y Base de Datos

Explicación de cómo funcionan los usuarios en el sistema Plaza Coche.

---

## ✅ Los Usuarios ESTÁN en MongoDB (NO son hardcoded)

### ¿Qué hace el script de inicialización?

El script `backend/scripts/init-data.js` crea usuarios **reales en MongoDB**:

```javascript
// Crear usuario en MongoDB
const user = new User({
    email: 'juan.garcia@iestacio.gva.es',
    password: 'user123', // Se hashea con bcrypt automáticamente
    nombre: 'Juan',
    apellidos: 'García López',
    role: 'user',
});

await user.save(); // ← GUARDA EN MONGODB
```

**Resultado:**

-   Los usuarios se guardan en la colección `users` de MongoDB
-   Las contraseñas se hashean con bcrypt (10 rounds)
-   Son datos persistentes (no se pierden al reiniciar)

---

## 🔄 Dos Formas de Crear Usuarios

### 1️⃣ Usuarios Iniciales (Seed Data)

**Propósito:** Tener datos de prueba para empezar

**Cómo:**

```bash
.\scripts_ps\init-db.ps1
```

**Crea:**

-   1 admin
-   5 usuarios de prueba
-   6 plazas de estacionamiento

**Ubicación del código:** `backend/scripts/init-data.js`

---

### 2️⃣ Registro de Nuevos Usuarios (Producción)

**Propósito:** Permitir que cualquiera cree una cuenta

**Cómo:**

1. Ir a http://localhost:8080
2. Hacer clic en "¿No tienes cuenta? Regístrate aquí"
3. Llenar el formulario de registro
4. Hacer clic en "Registrarse"

**Flujo técnico:**

```
FRONTEND (index.html)
   ↓
   Usuario llena formulario de registro
   ↓
FRONTEND (AuthService.js)
   ↓
   POST /api/auth/register
   {
     "email": "nuevo.usuario@iestacio.gva.es",
     "password": "password123",
     "nombre": "Nuevo",
     "apellidos": "Usuario"
   }
   ↓
BACKEND (routes/auth.js)
   ↓
   1. Verifica que el email no exista
   2. Crea nuevo documento User
   3. Hashea la contraseña con bcrypt
   4. Guarda en MongoDB
   ↓
MONGODB
   ↓
   Nuevo usuario creado en colección 'users'
   ↓
RESPUESTA AL FRONTEND
   ↓
   "Usuario registrado correctamente"
```

**Ubicación del código:**

-   Frontend: `frontend/index.html` (formulario)
-   Service: `frontend/js/AuthService.js` (método register)
-   Backend: `backend/routes/auth.js` (endpoint /register)

---

## 🗄️ Estructura en MongoDB

### Colección: `users`

```javascript
{
  _id: ObjectId("..."),
  email: "juan.garcia@iestacio.gva.es",
  password: "$2a$10$xyz...",  // Hash bcrypt
  nombre: "Juan",
  apellidos: "García López",
  role: "user",  // 'user' | 'admin'
  createdAt: ISODate("2024-10-19T...")
}
```

---

## 🔐 Seguridad de Contraseñas

### Modelo User con bcrypt

**Ubicación:** `backend/models/User.js`

```javascript
// Antes de guardar, hashea la contraseña
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Hash con 10 rounds (muy seguro)
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
```

**Resultado:**

-   Las contraseñas NUNCA se guardan en texto plano
-   Se usa bcrypt con 10 rounds (muy seguro)
-   Cada hash es único (incluye salt automático)

---

## 📊 Verificar Usuarios en MongoDB

### Desde terminal:

```bash
# Entrar al contenedor de MongoDB
docker exec -it plaza_coche_mongodb mongosh

# Conectar a la base de datos
use plaza_coche

# Ver todos los usuarios
db.users.find()

# Ver solo emails y nombres
db.users.find({}, {email: 1, nombre: 1, apellidos: 1, role: 1})

# Contar usuarios
db.users.countDocuments()

# Salir
exit
```

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Usuarios Iniciales

```bash
# 1. Inicializar datos
.\scripts_ps\init-db.ps1

# 2. Resultado en MongoDB:
# - admin@iestacio.gva.es
# - juan.garcia@iestacio.gva.es
# - maria.martinez@iestacio.gva.es
# - carlos.rodriguez@iestacio.gva.es
# - ana.fernandez@iestacio.gva.es
# - pedro.lopez@iestacio.gva.es
```

### Ejemplo 2: Registrar Usuario Nuevo

```javascript
// Frontend envía:
POST http://localhost:3000/api/auth/register
{
  "email": "lucia.sanchez@iestacio.gva.es",
  "password": "mipassword123",
  "nombre": "Lucía",
  "apellidos": "Sánchez Torres"
}

// Backend responde:
{
  "message": "Usuario registrado correctamente",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "lucia.sanchez@iestacio.gva.es",
    "nombre": "Lucía",
    "apellidos": "Sánchez Torres",
    "role": "user"
  }
}

// Ahora en MongoDB existe:
{
  _id: ObjectId("65f1a2b3c4d5e6f7g8h9i0j1"),
  email: "lucia.sanchez@iestacio.gva.es",
  password: "$2a$10$abcd...",  // Hash
  nombre: "Lucía",
  apellidos: "Sánchez Torres",
  role: "user"
}
```

---

## 🔄 Ciclo de Vida de un Usuario

```
1. REGISTRO
   └─> Usuario llena formulario
   └─> POST /api/auth/register
   └─> Contraseña se hashea con bcrypt
   └─> Se guarda en MongoDB (colección 'users')
   └─> Usuario creado ✅

2. LOGIN
   └─> Usuario ingresa email + password
   └─> POST /api/auth/login
   └─> Backend busca usuario en MongoDB
   └─> Compara password con hash (bcrypt.compare)
   └─> Si coincide: genera JWT token
   └─> Frontend guarda token en localStorage
   └─> Usuario autenticado ✅

3. USAR SISTEMA
   └─> Cada petición incluye JWT token en header
   └─> Backend verifica token (middleware)
   └─> Extrae userId del token
   └─> Usuario puede reservar plazas ✅

4. LOGOUT
   └─> Frontend elimina token de localStorage
   └─> Usuario desautenticado ✅
```

---

## ❓ Preguntas Frecuentes

### ¿Los usuarios son hardcoded?

❌ **NO**. Todos los usuarios están en MongoDB como documentos reales.

### ¿Puedo crear usuarios nuevos?

✅ **SÍ**. Usa el formulario de registro en http://localhost:8080

### ¿Las contraseñas son seguras?

✅ **SÍ**. Se hashean con bcrypt (10 rounds) antes de guardarlas.

### ¿Puedo ver los usuarios en MongoDB?

✅ **SÍ**. Usa `docker exec -it plaza_coche_mongodb mongosh`

### ¿Los usuarios se pierden al reiniciar?

❌ **NO**. Están en MongoDB (datos persistentes con volumen Docker).

### ¿Puedo hacer que solo los admins creen usuarios?

✅ **SÍ**. Puedes añadir el middleware `verifyAdmin` al endpoint `/register`.

---

## 🔧 Modificaciones Posibles

### Desactivar registro público

Si quieres que SOLO los admins creen usuarios:

```javascript
// backend/routes/auth.js
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Añadir middleware de admin
router.post('/register', verifyToken, verifyAdmin, async (req, res) => {
    // ... código existente
});
```

### Validar emails del dominio del instituto

```javascript
// backend/routes/auth.js
router.post('/register', async (req, res) => {
    const { email } = req.body;

    // Solo emails @iestacio.gva.es
    if (!email.endsWith('@iestacio.gva.es')) {
        return res.status(400).json({
            message: 'Solo se permiten emails del IES Estació',
        });
    }

    // ... resto del código
});
```

### Requerir confirmación de email

```javascript
// Añadir campo 'verified' al modelo User
verified: {
    type: Boolean,
    default: false
},

// Enviar email de confirmación (requiere servicio de email)
// Al hacer clic en el link, marcar verified: true
```

---

## 📚 Archivos Relacionados

**Backend:**

-   `backend/routes/auth.js` - Endpoints de registro y login
-   `backend/models/User.js` - Modelo con bcrypt
-   `backend/scripts/init-data.js` - Script de seed data

**Frontend:**

-   `frontend/index.html` - Formularios de login y registro
-   `frontend/js/AuthService.js` - Lógica de autenticación

**Base de Datos:**

-   MongoDB colección: `users`
-   Docker volumen: `mongo_data`

---

## 🎯 Resumen

| Aspecto                | Estado                 |
| ---------------------- | ---------------------- |
| Usuarios en MongoDB    | ✅ SÍ                  |
| Registro público       | ✅ SÍ                  |
| Contraseñas hasheadas  | ✅ SÍ (bcrypt)         |
| JWT para autenticación | ✅ SÍ (24h)            |
| Datos persistentes     | ✅ SÍ (volumen Docker) |
| Seed data incluido     | ✅ SÍ (6 usuarios)     |

---

**Proyecto:** Plaza Coche - Sistema de Alquiler de Plazas  
**Base de Datos:** MongoDB  
**Autenticación:** JWT + bcrypt  
**Fecha:** Octubre 2024
