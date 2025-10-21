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
dateFolder="$1"

# Si se especificó carpeta como parámetro, usar esa
if [ -n "$dateFolder" ]; then
    selectedFolder="$dateFolder"
else
    # Mostrar carpetas disponibles por fecha
    echo "Carpetas de backups disponibles:"
    echo ""
    
    folders=($(ls -1d "$backupDir"/*/ 2>/dev/null | xargs -n1 basename | sort -r))
    
    if [ ${#folders[@]} -eq 0 ]; then
        echo "No hay carpetas de backup disponibles"
        echo ""
        echo "Usa: ./backup-db.sh para crear uno"
        exit 1
    fi
    
    for i in "${!folders[@]}"; do
        echo "  [$i] ${folders[$i]}"
    done
    
    echo ""
    read -p "Selecciona la carpeta (número): " selection
    
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -lt "${#folders[@]}" ]; then
        selectedFolder="${folders[$selection]}"
    else
        echo "[ERROR] Selección inválida"
        exit 1
    fi
fi

# Ahora buscar el backup más nuevo en la carpeta seleccionada
targetDir="${backupDir}/${selectedFolder}"

if [ ! -d "$targetDir" ]; then
    echo "[ERROR] La carpeta no existe: $targetDir"
    exit 1
fi

# Obtener el backup más nuevo de esa carpeta
backupFile=$(ls -1 "${targetDir}"/*_users.json 2>/dev/null | sort -r | head -1)

if [ -z "$backupFile" ]; then
    echo "[ERROR] No hay backups en: $targetDir"
    exit 1
fi

backupName=$(basename "$backupFile" _users.json)
BackupTimestamp="${selectedFolder}/${backupName}"
echo "Usando backup más reciente: $BackupTimestamp"

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
docker cp "${backupPath}_schedules.json" plaza_coche_mongodb:/tmp/schedules.json 2>/dev/null
docker cp "${backupPath}_weeklyusages.json" plaza_coche_mongodb:/tmp/weeklyusages.json 2>/dev/null

# Importar cada colección
echo "   Importando usuarios..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=users --file=/tmp/users.json --jsonArray --drop 2>/dev/null

echo "   Importando plazas..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=parkingspots --file=/tmp/parkingspots.json --jsonArray --drop 2>/dev/null

echo "   Importando reservas..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=reservations --file=/tmp/reservations.json --jsonArray --drop 2>/dev/null

echo "   Importando horarios..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=schedules --file=/tmp/schedules.json --jsonArray --drop 2>/dev/null

echo "   Importando uso del cargador..."
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=weeklyusages --file=/tmp/weeklyusages.json --jsonArray --drop 2>/dev/null

echo ""
echo "========================================"
echo "  Restauración Completada"
echo "========================================"
echo ""

