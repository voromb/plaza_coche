# 🚀 Inicio Rápido - Plaza Coche

## Opción 1: Inicio Automático (Recomendado)

### Windows (PowerShell)

```powershell
.\scripts_ps\start.ps1
```

### Linux/Mac

```bash
./start.sh
```

Esto iniciará automáticamente:

-   ✅ MongoDB en puerto 27017
-   ✅ Backend API en http://localhost:3000
-   ✅ Frontend en http://localhost:8080
-   ✅ Abrirá el navegador automáticamente

---

## Opción 2: Manual con Docker

### 1. Iniciar servicios

```bash
docker-compose up --build -d
```

### 2. ⚠️ IMPORTANTE: Inicializar datos de prueba

**¡ESTE PASO ES OBLIGATORIO!** Sin inicializar los datos no podrás hacer login.

```powershell
# Windows (PowerShell)
.\scripts_ps\init-db.ps1

# Linux/Mac
./scripts_ps/init-db.sh
```

Este script crea:

-   ✅ Usuario admin: admin@iestacio.gva.es / admin123
-   ✅ Usuario normal: user@iestacio.gva.es / user123
-   ✅ 6 plazas de estacionamiento

### 3. Abrir aplicación

Navegar a: http://localhost:8080

---

## Usuarios de Prueba

⚠️ **IMPORTANTE**: Debes ejecutar `.\scripts_ps\init-db.ps1` (Windows) o `./init-db.sh` (Linux/Mac) antes de intentar hacer login.

Una vez inicializada la base de datos:

| Rol     | Email                     | Contraseña | Nombre Completo   |
| ------- | ------------------------- | ---------- | ----------------- |
| Admin   | admin@iestacio.gva.es     | admin123   | Admin IES Estació |
| Usuario | voro.moran@iestacio.gva.es | user123   | Voro Morán        |
| Usuario | xavi.smx@iestacio.gva.es  | user123    | Xavi SMX          |
| Usuario | jairo.smx@iestacio.gva.es | user123    | Jairo SMX         |
| Usuario | jordi.smx@iestacio.gva.es | user123    | Jordi SMX         |
| Usuario | miqui.profe@iestacio.gva.es | user123  | Miqui Profesor    |

---

## Funcionalidades por Rol

### 👤 Usuario Normal

-   ✅ Ver plazas disponibles
-   ✅ Reservar plazas
-   ✅ Ver mis reservas
-   ✅ Cancelar mis reservas

### 👨‍💼 Administrador

-   ✅ Gestionar todas las plazas (crear, editar, eliminar)
-   ✅ Ver todas las reservas
-   ✅ Ver todos los usuarios
-   ✅ Gestión completa del sistema

---

## Comandos Útiles

### Ver logs

```bash
docker-compose logs -f
```

### Detener servicios

```bash
docker-compose down
```

### Reiniciar un servicio

```bash
docker-compose restart backend
```

### Entrar al contenedor del backend

```bash
docker exec -it plaza_coche_backend sh
```

### Limpiar todo (incluye base de datos)

```bash
docker-compose down -v
```

---

## Verificar Instalación

### Backend funcionando

```bash
curl http://localhost:3000
```

Debería responder: `{"message": "API Plaza Coche funcionando correctamente"}`

### Frontend funcionando

Abrir: http://localhost:8080
Debería verse la página de login

---

## Solución Rápida de Problemas

### Error: "Puerto ya en uso"

```bash
# Detener y limpiar
docker-compose down
```

### Error: "Cannot connect to MongoDB"

```bash
# Esperar 10-15 segundos y recargar la página
# MongoDB tarda un poco en iniciar
```

### Error: "API not responding"

```bash
# Ver logs del backend
docker-compose logs backend

# Reiniciar backend
docker-compose restart backend
```

---

## Próximos Pasos

1. ✅ **Explora el sistema**: Prueba crear reservas, gestionar plazas
2. 📚 **Lee la documentación**: Ver `ARQUITECTURA.md` para entender el código
3. 🛠️ **Personaliza**: Modifica colores, añade funcionalidades
4. 🚀 **Despliega**: Sube a un servidor de producción

---

## 🔄 Trabajar en Diferentes PCs

### Hacer Backup (antes de subir a Git)

```powershell
.\scripts_ps\backup-db.ps1
```

Exporta la base de datos a `db_backups/` en formato JSON.

### Restaurar Backup (en otro PC)

```powershell
# 1. Clonar/actualizar repositorio
git pull

# 2. Iniciar Docker
docker-compose up -d

# 3. Restaurar tus datos
.\scripts_ps\restore-db.ps1
```

**Ver:** `DB_BACKUP_GUIDE.md` para más detalles.

---

## Recursos Adicionales

-   **Guía de Backups**: `DB_BACKUP_GUIDE.md` 📦
-   **Guía de Instalación Completa**: `INSTALL.md`
-   **Arquitectura del Sistema**: `ARQUITECTURA.md`
-   **Documentación API**: `README.md`

---

## ¿Necesitas Ayuda?

Abre un issue en GitHub: https://github.com/voromb/plaza_coche/issues

¡Disfruta usando Plaza Coche! 🚗🅿️
