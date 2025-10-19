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

#### Opción 1: Script Automático (Windows)

```powershell
.\scripts_ps\start.ps1
```

#### Opción 2: Manual

```bash
# 1. Iniciar servicios
docker-compose up --build -d

# 2. ⚠️ IMPORTANTE: Inicializar datos (OBLIGATORIO)
docker exec plaza_coche_backend node scripts/init-data.js

# 3. Abrir http://localhost:8080
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
-   **Backend API**: http://localhost:3000
-   **MongoDB**: localhost:27017

## 👤 Usuarios por Defecto

**Admin:**

-   admin@iestacio.gva.es / admin123

**Usuarios (todos con password: user123):**

-   juan.garcia@iestacio.gva.es (Juan García López)
-   maria.martinez@iestacio.gva.es (María Martínez Sánchez)
-   carlos.rodriguez@iestacio.gva.es (Carlos Rodríguez Pérez)
-   ana.fernandez@iestacio.gva.es (Ana Fernández Ruiz)
-   pedro.lopez@iestacio.gva.es (Pedro López González)

## 📁 Estructura del Proyecto

```
plaza_coche/
├── backend/          # API Express
│   └── scripts/      # Scripts de inicialización BD
├── frontend/         # Interfaz web
├── scripts_ps/       # Scripts PowerShell y Bash
├── docs/             # Documentación completa
├── db_backups/       # Backups de la base de datos (JSON)
├── .env              # Variables de entorno (incluido en Git - proyecto educativo)
└── docker-compose.yml
```

## 🔄 Scripts Disponibles

### Windows (PowerShell)

-   `.\scripts_ps\start.ps1` - Inicia todo el sistema automáticamente
-   `.\scripts_ps\init-db.ps1` - Inicializa datos de prueba
-   `.\scripts_ps\backup-db.ps1` - 📤 Exporta la base de datos a JSON
-   `.\scripts_ps\restore-db.ps1` - 📥 Restaura desde backup
-   `.\scripts_ps\setup-env.ps1` - Configura variables de entorno

### Linux/Mac

-   `./scripts_ps/start.sh` - Inicia todo el sistema automáticamente
-   `./scripts_ps/init-db.sh` - Inicializa datos de prueba

**💡 Tip:** Para trabajar en diferentes PCs, usa `backup-db.ps1` antes de hacer push y `restore-db.ps1` después de hacer pull.

## 📚 Documentación

-   `docs/QUICKSTART.md` - Inicio rápido
-   `docs/INSTALL.md` - Instalación detallada
-   `docs/ARQUITECTURA.md` - Arquitectura técnica
-   `docs/ESTRUCTURA.md` - Estructura del código
-   `docs/SEGURIDAD.md` - Guía de seguridad
-   `docs/DB_BACKUP_GUIDE.md` - Sistema de backups
-   `docs/PROYECTO_COMPLETO.md` - Resumen completo

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
