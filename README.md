# Plaza Coche - Sistema de Alquiler de Plazas de Estacionamiento

Sistema web para gestionar el alquiler de plazas de estacionamiento del instituto.

## 🚀 Tecnologías

-   **Frontend**: HTML, CSS, JavaScript (Vanilla JS con patrón Singleton)
-   **Backend**: Node.js + Express
-   **Base de Datos**: MongoDB
-   **Contenedores**: Docker + Docker Compose

## 📦 Instalación

### Con Docker (Recomendado)

**Nota:** El proyecto incluye el archivo `.env` configurado para desarrollo educativo.

```bash
# 1. Levantar servicios
docker-compose up -d

# 2. Restaurar datos desde backup
.\scripts_ps\restore-db.ps1  # Windows
./scripts_ps/restore-db.sh   # Linux/Mac

# 3. Acceder a http://localhost:8080
```

### Sin Docker

1. Instalar MongoDB localmente
2. Instalar dependencias del backend:

```bash
cd backend
npm install
npm start
```

3. Abrir `frontend/index.html` en el navegador

## 🌐 Acceso

-   **Frontend**: http://localhost:8080
-   **Backend API**: http://localhost:3010
-   **MongoDB**: localhost:27017

## 👤 Usuarios por Defecto

**Admin:**

-   admin@iestacio.gva.es / admin123

**Usuarios (todos con password: user123):**

-   voro.moran@iestacio.gva.es (Voro Morán)
-   xavi.smx@iestacio.gva.es (Xavi SMX)
-   jairo.smx@iestacio.gva.es (Jairo SMX)
-   jordi.smx@iestacio.gva.es (Jordi SMX)
-   miqui.profe@iestacio.gva.es (Miqui Profesor)

## 📁 Estructura del Proyecto

```
plaza_coche/
├── backend/          # API Express
├── frontend/         # Interfaz web
├── scripts_ps/       # Scripts de backup/restore
├── db_backups/       # Backups de la base de datos (JSON)
├── .env              # Variables de entorno (incluido en Git - proyecto educativo)
├── docker-compose.yml
├── DOCUMENTACION.md  # Documentación completa
└── README.md
```

## 🔄 Scripts Disponibles

### Windows (PowerShell)

-   `.\scripts_ps\backup-db.ps1` - Exporta la base de datos a JSON (organizado por fecha)
-   `.\scripts_ps\restore-db.ps1` - Restaura desde backup

### Linux/Mac

-   `./scripts_ps/backup-db.sh` - Exporta la base de datos a JSON (organizado por fecha)
-   `./scripts_ps/restore-db.sh` - Restaura desde backup

**Estructura de backups:**
```
db_backups/
├── 2025-10-21/
│   ├── backup_20251021_120000_users.json
│   ├── backup_20251021_120000_parkingspots.json
│   └── backup_20251021_120000_reservations.json
└── 2025-10-22/
    └── backup_20251022_100000_users.json
```

**Uso de restore:**

```powershell
# Windows - El script te pide la carpeta, luego coge el backup más nuevo
.\scripts_ps\restore-db.ps1

# Windows - O especifica la carpeta directamente (sin diálogo)
.\scripts_ps\restore-db.ps1 2025-10-21
```

```bash
# Linux/Mac - El script te pide la carpeta, luego coge el backup más nuevo
./scripts_ps/restore-db.sh

# Linux/Mac - O especifica la carpeta directamente (sin diálogo)
./scripts_ps/restore-db.sh 2025-10-21
```

**Flujo:**
1. Ejecuta el script sin parámetros
2. El script muestra las carpetas disponibles (por fecha)
3. Tú seleccionas el número de la carpeta
4. El script automáticamente coge el backup más nuevo de esa carpeta
5. El script restaura y te pide confirmación

**Tip:** Los backups se organizan en carpetas por fecha. Para trabajar en diferentes PCs, usa `backup-db.ps1` antes de hacer push y `restore-db.ps1` después de hacer pull.

## 📚 Documentación

Ver `DOCUMENTACION.md` para la guía completa con:
- Instalación detallada
- Arquitectura técnica
- Estructura del código
- Seguridad
- Sistema de backups
- Solución de problemas

## 🔐 Endpoints API

### Auth

-   POST `/api/auth/register` - Registro
-   POST `/api/auth/login` - Login

### Usuario

-   GET `/api/user/parking-spots` - Ver plazas disponibles
-   POST `/api/user/reserve` - Reservar plaza
-   GET `/api/user/my-reservations` - Mis reservas

### Admin

-   GET `/api/admin/all-reservations` - Todas las reservas
-   POST `/api/admin/parking-spot` - Crear plaza
-   DELETE `/api/admin/parking-spot/:id` - Eliminar plaza
-   GET `/api/admin/parking-spots` - Todas las plazas
