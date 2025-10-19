# 📦 Guía de Backup y Restauración de Base de Datos

## Para Proyecto Educativo

Esta guía te permite trabajar con el proyecto en diferentes PCs manteniendo tus datos.

---

## 🔄 Opciones para Trabajar en Diferentes PCs

### Opción 1: Datos Iniciales (Recomendado para empezar)

Usa el script de inicialización que crea datos de prueba:

```powershell
.\scripts_ps\init-db.ps1
```

**Crea:**

-   ✅ 2 usuarios (admin y user)
-   ✅ 6 plazas de estacionamiento
-   ✅ Base limpia para empezar

**Cuándo usar:** Al clonar el proyecto por primera vez en un PC nuevo.

---

### Opción 2: Backup de Tus Datos (Para continuar tu trabajo)

Si ya trabajaste en el proyecto y quieres llevar tus datos a otro PC.

#### 📤 Hacer Backup (PC Origen)

```powershell
.\scripts_ps\backup-db.ps1
```

**Resultado:**

```
db_backups/
├── backup_20241019_103045_users.json
├── backup_20241019_103045_parkingspots.json
└── backup_20241019_103045_reservations.json
```

**Estos archivos JSON:**

-   ✅ Son legibles (puedes abrirlos con cualquier editor)
-   ✅ Se pueden subir a Git
-   ✅ Son portables entre PCs

#### 📥 Restaurar Backup (PC Destino)

```powershell
.\scripts_ps\restore-db.ps1
```

El script te mostrará los backups disponibles y podrás elegir cuál restaurar.

**Alternativa:** Especifica directamente el backup:

```powershell
.\scripts_ps\restore-db.ps1 -BackupTimestamp "backup_20241019_103045"
```

---

## 🔄 Flujo de Trabajo Típico

### PC Principal (Casa)

1. Trabajas en el proyecto
2. Creas reservas, modificas plazas, etc.
3. Antes de terminar:
    ```powershell
    .\scripts_ps\backup-db.ps1
    ```
4. Subes a Git:
    ```bash
    git add .
    git commit -m "Actualización con datos del día"
    git push
    ```

### PC Secundario (Instituto)

1. Clonas o actualizas:
    ```bash
    git pull
    ```
2. Inicias Docker:
    ```powershell
    docker-compose up -d
    ```
3. Restauras tus datos:
    ```powershell
    .\scripts_ps\restore-db.ps1
    ```
4. ¡Continúas trabajando con tus datos!

---

## 📊 Estructura de los Backups

### Formato JSON

Los backups son archivos JSON legibles:

```json
// backup_20241019_103045_users.json
[
    {
        "_id": { "$oid": "..." },
        "email": "admin@iestacio.gva.es",
        "nombre": "Admin",
        "apellidos": "IES Estació",
        "role": "admin"
    }
    // ... más usuarios
]
```

**Ventajas:**

-   ✅ Legible por humanos
-   ✅ Compatible con Git (diff visible)
-   ✅ Editable si es necesario
-   ✅ Compatible con cualquier OS

---

## ⚙️ Comandos Rápidos

### Hacer backup rápido

```powershell
.\scripts_ps\backup-db.ps1
```

### Ver backups disponibles

```powershell
Get-ChildItem db_backups -Filter "*_users.json" | Select-Object Name
```

### Restaurar último backup

```powershell
.\scripts_ps\restore-db.ps1
# Selecciona el [0] que es el más reciente
```

### Limpiar backups antiguos

```powershell
# Eliminar backups de más de 7 días
Get-ChildItem db_backups -Filter "*.json" |
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} |
  Remove-Item
```

---

## 🗂️ Organización Recomendada

```
plaza_coche/
├── db_backups/                    # Backups locales
│   ├── backup_20241019_103045_*   # Backup del viernes
│   ├── backup_20241020_154523_*   # Backup del lunes
│   └── backup_20241021_092341_*   # Backup del martes
│
└── scripts_ps/                    # Scripts PowerShell
    ├── backup-db.ps1              # Script para hacer backup
    ├── restore-db.ps1             # Script para restaurar
    └── init-db.ps1                # Script datos iniciales
```

---

## ⚠️ Notas Importantes

### Para Git

**✅ PUEDES subir:**

-   `db_backups/*.json` - Tus backups (proyecto educativo)
-   `.env` - Configuración (proyecto educativo)
-   Todo el código fuente

**❌ NO subas en producción:**

-   Backups con datos sensibles
-   Credenciales reales
-   Datos de usuarios reales

### Tamaño de Backups

Los archivos JSON pueden crecer:

-   Usuarios: ~500 bytes por usuario
-   Plazas: ~200 bytes por plaza
-   Reservas: ~300 bytes por reserva

**Ejemplo:** 100 usuarios + 50 plazas + 200 reservas ≈ 100KB (muy manejable para Git)

---

## 🆘 Solución de Problemas

### Error: "El contenedor de MongoDB no está corriendo"

```powershell
docker-compose up -d
# Espera 10 segundos
.\scripts_ps\backup-db.ps1
```

### Error: "No se encontró el backup"

Verifica que existen los archivos:

```powershell
dir db_backups
```

### Backup corrupto o incompleto

Vuelve a hacer el backup:

```powershell
.\scripts_ps\backup-db.ps1
```

### Restaurar datos iniciales

```powershell
.\scripts_ps\init-db.ps1
```

---

## 🎯 Resumen

| Tarea           | Comando                       | Cuándo                        |
| --------------- | ----------------------------- | ----------------------------- |
| Datos iniciales | `.\scripts_ps\init-db.ps1`    | Primera vez / reset           |
| Hacer backup    | `.\scripts_ps\backup-db.ps1`  | Antes de cerrar / subir a Git |
| Restaurar       | `.\scripts_ps\restore-db.ps1` | Al cambiar de PC              |

---

## 📚 Más Información

-   Ver `QUICKSTART.md` para inicio rápido
-   Ver `README.md` para información general
-   Ver `INSTALL.md` para instalación completa

---

**💡 Tip:** Haz backups frecuentemente, especialmente antes de:

-   Subir cambios a Git
-   Cambiar de PC
-   Modificar datos importantes
-   Probar funcionalidades nuevas
