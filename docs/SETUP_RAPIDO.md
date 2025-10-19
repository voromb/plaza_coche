# ⚡ Setup Rápido - Nuevo PC

Guía para iniciar el proyecto en un PC nuevo en **menos de 2 minutos**.

## 📋 Requisitos Previos

-   Docker Desktop instalado y corriendo
-   Git instalado

## 🚀 Pasos

### 1. Clonar el proyecto

```bash
git clone https://github.com/voromb/plaza_coche.git
cd plaza_coche
```

### 2. Iniciar el proyecto (TODO EN UNO)

**Windows (PowerShell):**

```powershell
.\scripts_ps\start.ps1
```

**Linux/Mac:**

```bash
./scripts_ps/start.sh
```

### 3. ¡Listo! 🎉

El script automáticamente:

-   ✅ Crea el archivo `.env` si no existe
-   ✅ Inicia los contenedores Docker
-   ✅ Espera a que estén listos
-   ✅ Inicializa los datos de prueba
-   ✅ Abre el navegador en http://localhost:8080

## 👤 Login

**Admin:**

-   Email: `admin@iestacio.gva.es`
-   Password: `admin123`

**Usuarios (todos con password: user123):**

-   `juan.garcia@iestacio.gva.es`
-   `maria.martinez@iestacio.gva.es`
-   `carlos.rodriguez@iestacio.gva.es`
-   `ana.fernandez@iestacio.gva.es`
-   `pedro.lopez@iestacio.gva.es`

## 🔧 Comandos Útiles

```powershell
# Ver logs en tiempo real
docker-compose logs -f

# Detener todo
docker-compose down

# Reiniciar solo el backend
docker-compose restart backend

# Hacer backup de la BD
.\scripts_ps\backup-db.ps1

# Restaurar backup de la BD
.\scripts_ps\restore-db.ps1
```

## 🆘 Si algo falla

### Puerto ocupado

Si ves error de puerto ocupado (27017), el script ya lo maneja automáticamente usando el puerto **27018**.

### Contenedores no inician

```powershell
# Limpiar todo y empezar de cero
docker-compose down -v
.\scripts_ps\start.ps1
```

### No se crean los datos

```powershell
# Ejecutar manualmente la inicialización
.\scripts_ps\init-db.ps1
```

## 📚 Más Información

-   `README.md` - Documentación general
-   `docs/QUICKSTART.md` - Inicio rápido detallado
-   `docs/` - Documentación completa

---

**💡 Tip:** Este proyecto incluye el archivo `.env` en Git porque es un proyecto de estudios. En producción NO se sube.
