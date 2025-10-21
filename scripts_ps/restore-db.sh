#!/bin/bash

# ========================================
# Restaurar Base de Datos
# Importa desde archivos JSON
# ========================================

echo "========================================"
echo "  Restaurar Base de Datos"
echo "========================================"
echo ""

# Verificar que el contenedor esté corriendo
container=$(docker ps --filter "name=plaza_coche_mongodb" --format "{{.Names}}")
if [ -z "$container" ]; then
    echo "[ERROR] El contenedor de MongoDB no está corriendo"
    echo "Ejecuta primero: docker-compose up -d"
    exit 1
fi

backupDir="db_backups"

# Si no se especificó timestamp como argumento, mostrar backups disponibles
if [ -z "$1" ]; then
    echo "Backups disponibles:"
    echo ""
    
    # Listar backups disponibles
    backups=($(ls -1 "$backupDir"/*_users.json 2>/dev/null | sed 's/_users.json$//' | xargs -n1 basename | sort -r))
    
    if [ ${#backups[@]} -eq 0 ]; then
        echo "No hay backups disponibles"
        echo ""
        echo "Usa: ./backup-db.sh para crear uno"
        exit 1
    fi
    
    for i in "${!backups[@]}"; do
        echo "  [$i] ${backups[$i]}"
    done
    
    echo ""
    read -p "Selecciona el número del backup a restaurar: " selection
    
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -lt "${#backups[@]}" ]; then
        BackupTimestamp="${backups[$selection]}"
    else
        echo "[ERROR] Selección inválida"
        exit 1
    fi
else
    BackupTimestamp="$1"
fi

backupPath="${backupDir}/${BackupTimestamp}"

# Verificar que existan los archivos
if [ ! -f "${backupPath}_users.json" ]; then
    echo "[ERROR] No se encontró el backup: $BackupTimestamp"
    exit 1
fi

echo ""
echo "ADVERTENCIA: Esto eliminará los datos actuales"
read -p "¿Continuar? (s/n): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "Operación cancelada"
    exit 0
fi

echo ""
echo "Restaurando base de datos..."
echo ""

# Copiar archivos al contenedor
echo "   Preparando archivos..."
docker cp "${backupPath}_users.json" plaza_coche_mongodb:/tmp/users.json
docker cp "${backupPath}_parkingspots.json" plaza_coche_mongodb:/tmp/parkingspots.json
docker cp "${backupPath}_reservations.json" plaza_coche_mongodb:/tmp/reservations.json

# Importar cada colección
echo "   Importando usuarios..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=users --file=/tmp/users.json --jsonArray --drop 2>/dev/null

echo "   Importando plazas..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=parkingspots --file=/tmp/parkingspots.json --jsonArray --drop 2>/dev/null

echo "   Importando reservas..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=reservations --file=/tmp/reservations.json --jsonArray --drop 2>/dev/null

echo ""
echo "========================================"
echo "  Restauración Completada"
echo "========================================"
echo ""

