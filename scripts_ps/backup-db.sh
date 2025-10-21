#!/bin/bash

# ========================================
# Backup de Base de Datos
# Exporta MongoDB a archivos JSON
# ========================================

echo "========================================"
echo "  Backup de Base de Datos"
echo "========================================"
echo ""

# Verificar que el contenedor esté corriendo
container=$(docker ps --filter "name=plaza_coche_mongodb" --format "{{.Names}}")
if [ -z "$container" ]; then
    echo "[ERROR] El contenedor de MongoDB no está corriendo"
    echo "Ejecuta primero: docker-compose up -d"
    exit 1
fi

# Crear carpeta de backups si no existe
backupDir="db_backups"
if [ ! -d "$backupDir" ]; then
    mkdir -p "$backupDir"
    echo "[✓] Carpeta '$backupDir' creada"
fi

# Timestamp para el backup
timestamp=$(date +"%Y%m%d_%H%M%S")
backupPath="${backupDir}/backup_${timestamp}"

echo "Exportando base de datos..."
echo ""

# Exportar cada colección a JSON
echo "   Exportando usuarios..."
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=users --out=/tmp/users.json --jsonArray 2>/dev/null
docker cp plaza_coche_mongodb:/tmp/users.json "${backupPath}_users.json" 2>/dev/null

echo "   Exportando plazas..."
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=parkingspots --out=/tmp/parkingspots.json --jsonArray 2>/dev/null
docker cp plaza_coche_mongodb:/tmp/parkingspots.json "${backupPath}_parkingspots.json" 2>/dev/null

echo "   Exportando reservas..."
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=reservations --out=/tmp/reservations.json --jsonArray 2>/dev/null
docker cp plaza_coche_mongodb:/tmp/reservations.json "${backupPath}_reservations.json" 2>/dev/null

echo ""
echo "========================================"
echo "  Backup Completado"
echo "========================================"
echo ""
echo "Archivos guardados en:"
echo "  ${backupPath}_users.json"
echo "  ${backupPath}_parkingspots.json"
echo "  ${backupPath}_reservations.json"
echo ""
echo "Estos archivos se pueden subir a Git"
echo ""

