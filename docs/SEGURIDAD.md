# 🔒 Guía de Seguridad - Plaza Coche

## Variables de Entorno

### Archivo .env

El proyecto utiliza variables de entorno para mantener la seguridad y evitar exponer credenciales en el código.

#### Configuración Inicial

1. **Copia el archivo de ejemplo:**

    ```bash
    cp .env.example .env
    ```

2. **Edita el archivo `.env` con tus valores:**

    ```bash
    # Windows
    notepad .env

    # Linux/Mac
    nano .env
    ```

3. **Variables importantes a cambiar en producción:**
    - `JWT_SECRET`: Usa un string largo y aleatorio
    - `MONGO_USERNAME`: Usuario de MongoDB
    - `MONGO_PASSWORD`: Contraseña segura para MongoDB

### Generar JWT Secret Seguro

**Linux/Mac:**

```bash
openssl rand -base64 64
```

**Windows (PowerShell):**

```powershell
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Node.js:**

```javascript
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## Checklist de Seguridad para Producción

### 🔴 CRÍTICO - Antes de Desplegar

-   [ ] Cambiar `JWT_SECRET` por valor aleatorio largo
-   [ ] Configurar credenciales de MongoDB (`MONGO_USERNAME`, `MONGO_PASSWORD`)
-   [ ] **NUNCA** subir el archivo `.env` a Git (está en `.gitignore`)
-   [ ] Usar HTTPS en producción (Let's Encrypt)
-   [ ] Cambiar contraseñas de usuarios por defecto

### 🟡 IMPORTANTE - Mejoras de Seguridad

-   [ ] Implementar rate limiting en el backend
-   [ ] Añadir validación de entrada más estricta
-   [ ] Configurar CORS solo para dominios permitidos
-   [ ] Usar helmet.js para headers de seguridad
-   [ ] Implementar refresh tokens para JWT
-   [ ] Añadir logging de accesos
-   [ ] Configurar firewall en servidor

### 🟢 RECOMENDADO - Buenas Prácticas

-   [ ] Backups automáticos de MongoDB
-   [ ] Monitoreo de logs
-   [ ] Implementar 2FA para administradores
-   [ ] Políticas de contraseñas más fuertes
-   [ ] Auditoría de accesos

---

## Estructura de .env

### Desarrollo Local (Actual)

```env
# Sin autenticación MongoDB para facilitar desarrollo
MONGO_USERNAME=
MONGO_PASSWORD=
MONGO_URI=mongodb://mongodb:27017/plaza_coche
JWT_SECRET=plaza_coche_jwt_secret_key_2024_cambiar_en_produccion
```

### Producción (Recomendado)

```env
# Con autenticación completa
MONGO_USERNAME=admin_plaza_coche
MONGO_PASSWORD=Pa$$w0rd_Muy_Segur0_Y_L4rg0!
MONGO_URI=mongodb://admin_plaza_coche:Pa$$w0rd_Muy_Segur0_Y_L4rg0!@mongodb:27017/plaza_coche?authSource=admin
JWT_SECRET=k8n2m9P4xQr7sT0vW3yZ5aB6cD1eF8gH9jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1d
```

---

## CORS en Producción

Editar `backend/server.js`:

```javascript
const cors = require('cors');

// Desarrollo (permite todo)
app.use(cors());

// Producción (solo dominios específicos)
const corsOptions = {
    origin: ['https://tudominio.com', 'https://www.tudominio.com'],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
```

---

## Headers de Seguridad

Instalar helmet.js:

```bash
npm install helmet
```

Añadir en `backend/server.js`:

```javascript
const helmet = require('helmet');

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
    })
);
```

---

## Rate Limiting

Instalar express-rate-limit:

```bash
npm install express-rate-limit
```

Añadir en `backend/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // límite de 100 peticiones por IP
    message: 'Demasiadas peticiones desde esta IP',
});

app.use('/api/', limiter);

// Más estricto para login
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login',
});

app.use('/api/auth/login', authLimiter);
```

---

## Validación de Entrada

Instalar express-validator:

```bash
npm install express-validator
```

Ejemplo en rutas:

```javascript
const { body, validationResult } = require('express-validator');

router.post(
    '/register',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('nombre').trim().notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // ... resto del código
    }
);
```

---

## HTTPS en Producción

### Opción 1: Let's Encrypt con Certbot

```bash
# Instalar certbot
sudo apt-get install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tudominio.com

# Renovación automática
sudo certbot renew --dry-run
```

### Opción 2: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## MongoDB Seguro

### Backup Automático

```bash
# Script de backup
mongodump --uri="mongodb://user:pass@localhost:27017/plaza_coche" --out=/backups/$(date +%Y%m%d)

# Cron job (cada día a las 3 AM)
0 3 * * * /ruta/al/script/backup.sh
```

### Crear Usuario MongoDB

```javascript
// Conectar a MongoDB
mongo

// Crear usuario admin
use admin
db.createUser({
  user: "admin_plaza_coche",
  pwd: "password_muy_seguro",
  roles: [
    { role: "readWrite", db: "plaza_coche" }
  ]
})
```

---

## Logging de Seguridad

Instalar winston:

```bash
npm install winston
```

Crear `backend/utils/logger.js`:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

module.exports = logger;
```

Usar en el código:

```javascript
const logger = require('./utils/logger');

// En login
logger.info('Login attempt', { email, ip: req.ip });

// En errores
logger.error('Login failed', { email, ip: req.ip, error: error.message });
```

---

## Resumen de Archivos Sensibles

### ❌ NUNCA subir a Git:

-   `.env`
-   `.env.production`
-   `.env.local`
-   `node_modules/`
-   Backups de base de datos
-   Archivos de log con información sensible

### ✅ SÍ subir a Git:

-   `.env.example` (sin valores reales)
-   Toda la estructura del código
-   Documentación

---

## Contacto de Seguridad

Si encuentras una vulnerabilidad de seguridad, por favor **NO** abras un issue público.
Envía un email a: seguridad@iestacio.gva.es

---

**Recuerda:** La seguridad es un proceso continuo, no un estado final. Mantén el sistema actualizado y revisa regularmente las configuraciones de seguridad.
