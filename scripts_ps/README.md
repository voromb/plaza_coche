# 🔧 Scripts de Automatización

Scripts PowerShell y Bash para automatizar tareas del proyecto.

## Scripts Disponibles

### Windows (PowerShell)

| Script           | Descripción                       |
| ---------------- | --------------------------------- |
| `start.ps1`      | Inicia todo el sistema (Docker)   |
| `init-db.ps1`    | Inicializa datos de prueba        |
| `backup-db.ps1`  | Exporta base de datos a JSON      |
| `restore-db.ps1` | Restaura base de datos desde JSON |
| `setup-env.ps1`  | Crea archivos .env                |

### Linux/Mac (Bash)

| Script         | Descripción                     |
| -------------- | ------------------------------- |
| `start.sh`     | Inicia todo el sistema (Docker) |
| `init-db.sh`   | Inicializa datos de prueba      |
| `setup-env.sh` | Crea archivos .env              |

## Uso

Desde la raíz del proyecto:

```powershell
# Windows
.\scripts_ps\start.ps1
.\scripts_ps\backup-db.ps1
.\scripts_ps\restore-db.ps1
```

```bash
# Linux/Mac
./scripts_ps/start.sh
./scripts_ps/init-db.sh
```

## Documentación Completa

Ver `docs/` para documentación detallada sobre cada script.
