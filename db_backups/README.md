# 📦 Backups de Base de Datos

Esta carpeta contiene los backups exportados de MongoDB en formato JSON.

## 📋 Archivos de Backup

Cada backup consiste en 3 archivos:

```
backup_YYYYMMDD_HHMMSS_users.json         # Usuarios
backup_YYYYMMDD_HHMMSS_parkingspots.json  # Plazas de estacionamiento
backup_YYYYMMDD_HHMMSS_reservations.json  # Reservas
```

## 🔧 Cómo Usar

### Crear un Backup

```powershell
# Desde la raíz del proyecto
.\backup-db.ps1
```

### Restaurar un Backup

```powershell
# Desde la raíz del proyecto
.\restore-db.ps1
```

El script te mostrará los backups disponibles para elegir.

## 📝 Formato JSON

Los archivos son JSON estándar y se pueden editar manualmente si es necesario:

```json
[
    {
        "_id": { "$oid": "..." },
        "email": "admin@iestacio.gva.es",
        "nombre": "Admin",
        "role": "admin"
    }
]
```

## ⚠️ Importante

-   ✅ Estos archivos **SÍ** se pueden subir a Git (proyecto educativo)
-   ✅ Son portables entre diferentes sistemas operativos
-   ✅ Se pueden editar con cualquier editor de texto
-   ⚠️ En producción real, NO subir backups con datos sensibles

## 🗂️ Gestión de Backups

### Ver backups disponibles

```powershell
dir db_backups -Filter "*_users.json"
```

### Eliminar backups antiguos (más de 7 días)

```powershell
Get-ChildItem db_backups -Filter "*.json" |
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} |
  Remove-Item
```

## 📚 Más Información

Ver `DB_BACKUP_GUIDE.md` en la raíz del proyecto para la guía completa.
