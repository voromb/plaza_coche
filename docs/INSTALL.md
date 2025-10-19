# 🚀 Guía de Instalación - Plaza Coche

## Opción 1: Con Docker (Recomendado)

### Requisitos

-   Docker Desktop instalado
-   Docker Compose

### Pasos

1. **Clonar el repositorio**

    ```bash
    git clone https://github.com/voromb/plaza_coche.git
    cd plaza_coche
    ```

2. **Iniciar todos los servicios**

    ```bash
    docker-compose up --build
    ```

3. **Esperar a que todos los servicios estén listos**

    - MongoDB: puerto 27017
    - Backend API: http://localhost:3000
    - Frontend: http://localhost:8080

4. **Inicializar datos de prueba** (en otra terminal)

    ```powershell
    # Windows (PowerShell) - Script automático
    .\scripts_ps\init-db.ps1

    # Linux/Mac
    ./scripts_ps/init-db.sh

    # O manualmente:
    docker exec plaza_coche_backend node scripts/init-data.js
    ```

5. **Acceder a la aplicación**
    - Abrir navegador en: http://localhost:8080
    - Login Admin: `admin@iestacio.gva.es` / `admin123`
    - Login Usuario: `user@iestacio.gva.es` / `user123`

### Comandos útiles

```bash
# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar un servicio específico
docker-compose restart backend

# Limpiar todo (incluye volúmenes)
docker-compose down -v
```

---

## Opción 2: Instalación Local (Sin Docker)

### Requisitos

-   Node.js 18+ instalado
-   MongoDB instalado y corriendo localmente

### Pasos

1. **Clonar el repositorio**

    ```bash
    git clone https://github.com/voromb/plaza_coche.git
    cd plaza_coche
    ```

2. **Configurar Backend**

    ```bash
    cd backend
    npm install
    ```

3. **Iniciar MongoDB** (si no está corriendo)

    ```bash
    # Windows
    mongod

    # Linux/Mac
    sudo systemctl start mongodb
    ```

4. **Modificar configuración de conexión**

    - Editar `backend/config/db.js`
    - Cambiar la URI de MongoDB a: `mongodb://localhost:27017/plaza_coche`

5. **Iniciar el backend**

    ```bash
    # Desde la carpeta backend
    npm start

    # O en modo desarrollo
    npm run dev
    ```

6. **Inicializar datos de prueba** (en otra terminal)

    ```bash
    # Desde la raíz del proyecto
    node scripts/init-data.js
    ```

7. **Abrir el frontend**

    - Opción A: Usar Live Server (VSCode extension)
    - Opción B: Usar cualquier servidor HTTP simple:

        ```bash
        # Python 3
        cd frontend
        python -m http.server 8080

        # Node.js (instalar primero: npm install -g http-server)
        cd frontend
        http-server -p 8080
        ```

8. **Modificar URL del API en el frontend**

    - Editar `frontend/js/ApiService.js`
    - Línea 10: asegurar que `baseURL` es `http://localhost:3000/api`

9. **Acceder a la aplicación**
    - Abrir navegador en: http://localhost:8080
    - Login Admin: `admin@iestacio.gva.es` / `admin123`
    - Login Usuario: `user@iestacio.gva.es` / `user123`

---

## Verificar Instalación

### Backend

```bash
# Probar endpoint de prueba
curl http://localhost:3000

# Debería responder:
# {"message": "API Plaza Coche funcionando correctamente"}
```

### Frontend

-   Abrir http://localhost:8080
-   Deberías ver la página de login

### MongoDB

```bash
# Conectar a MongoDB
mongo plaza_coche

# Ver colecciones
show collections

# Ver usuarios
db.users.find()
```

---

## Solución de Problemas

### Error: "MongoDB connection failed"

-   Verificar que MongoDB está corriendo
-   Verificar la URI de conexión
-   En Docker: esperar 10-15 segundos después de iniciar

### Error: "CORS policy"

-   Verificar que el backend está corriendo en puerto 3000
-   Verificar configuración de CORS en `backend/server.js`

### Error: "Cannot connect to API"

-   Verificar que la URL en `ApiService.js` es correcta
-   Abrir consola del navegador (F12) para ver errores

### Puerto ya en uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
MONGO_URI=mongodb://mongodb:27017/plaza_coche
JWT_SECRET=cambiar_por_secreto_seguro_en_produccion
PORT=3000
```

**IMPORTANTE**: En producción, cambiar `JWT_SECRET` por un valor seguro y único.
