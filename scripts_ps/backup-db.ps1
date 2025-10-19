# ========================================
# Backup de Base de Datos
# Exporta MongoDB a archivos JSON
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backup de Base de Datos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el contenedor esté corriendo
$container = docker ps --filter "name=plaza_coche_mongodb" --format "{{.Names}}"
if (-not $container) {
    Write-Host "[ERROR] El contenedor de MongoDB no está corriendo" -ForegroundColor Red
    Write-Host "Ejecuta primero: docker-compose up -d" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Crear carpeta de backups si no existe
$backupDir = "db_backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "[✓] Carpeta '$backupDir' creada" -ForegroundColor Green
}

# Timestamp para el backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$backupDir/backup_$timestamp"

Write-Host "Exportando base de datos..." -ForegroundColor Yellow
Write-Host ""

# Exportar cada colección a JSON
Write-Host "  → Exportando usuarios..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=users --out=/tmp/users.json --jsonArray 2>$null
docker cp plaza_coche_mongodb:/tmp/users.json "$backupPath`_users.json" 2>$null

Write-Host "  → Exportando plazas..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=parkingspots --out=/tmp/parkingspots.json --jsonArray 2>$null
docker cp plaza_coche_mongodb:/tmp/parkingspots.json "$backupPath`_parkingspots.json" 2>$null

Write-Host "  → Exportando reservas..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=reservations --out=/tmp/reservations.json --jsonArray 2>$null
docker cp plaza_coche_mongodb:/tmp/reservations.json "$backupPath`_reservations.json" 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backup Completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos guardados en:" -ForegroundColor White
Write-Host "  $backupPath`_users.json" -ForegroundColor Cyan
Write-Host "  $backupPath`_parkingspots.json" -ForegroundColor Cyan
Write-Host "  $backupPath`_reservations.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estos archivos se pueden subir a Git" -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para continuar"

