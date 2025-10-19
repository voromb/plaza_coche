# Scripts de Inicialización de Base de Datos

Este directorio contiene scripts para inicializar y gestionar datos de la base de datos.

## init-data.js

Script para crear datos iniciales de prueba en la base de datos.

**Crea:**

-   1 admin + 5 usuarios normales (6 usuarios en total)
-   6 plazas de estacionamiento

**Uso desde el host:**

```bash
docker exec plaza_coche_backend node scripts/init-data.js
```

**Uso desde el contenedor:**

```bash
node scripts/init-data.js
```

## Usuarios creados

| Rol   | Email                            | Contraseña | Nombre Completo        |
| ----- | -------------------------------- | ---------- | ---------------------- |
| Admin | admin@iestacio.gva.es            | admin123   | Admin IES Estació      |
| User  | juan.garcia@iestacio.gva.es      | user123    | Juan García López      |
| User  | maria.martinez@iestacio.gva.es   | user123    | María Martínez Sánchez |
| User  | carlos.rodriguez@iestacio.gva.es | user123    | Carlos Rodríguez Pérez |
| User  | ana.fernandez@iestacio.gva.es    | user123    | Ana Fernández Ruiz     |
| User  | pedro.lopez@iestacio.gva.es      | user123    | Pedro López González   |

## Notas

-   Este script se ejecuta automáticamente al usar `.\scripts_ps\start.ps1`
-   Se puede ejecutar manualmente con `.\scripts_ps\init-db.ps1`
-   Borra todos los datos existentes antes de crear los nuevos
