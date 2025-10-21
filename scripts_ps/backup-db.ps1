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

# Crear carpeta con la fecha del día
$dateFolder = Get-Date -Format "yyyy-MM-dd"
$backupDayDir = "$backupDir/$dateFolder"
if (-not (Test-Path $backupDayDir)) {
    New-Item -ItemType Directory -Path $backupDayDir | Out-Null
    Write-Host "[✓] Carpeta '$backupDayDir' creada" -ForegroundColor Green
}

# Timestamp para el backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$backupDayDir/backup_$timestamp"

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

Write-Host "  → Exportando horarios..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=schedules --out=/tmp/schedules.json --jsonArray 2>$null
docker cp plaza_coche_mongodb:/tmp/schedules.json "$backupPath`_schedules.json" 2>$null

Write-Host "  → Exportando uso del cargador..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoexport --db=plaza_coche --collection=weeklyusages --out=/tmp/weeklyusages.json --jsonArray 2>$null
docker cp plaza_coche_mongodb:/tmp/weeklyusages.json "$backupPath`_weeklyusages.json" 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backup Completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Guardado en: db_backups/$dateFolder/" -ForegroundColor White
Write-Host "  backup_$timestamp`_users.json" -ForegroundColor Cyan
Write-Host "  backup_$timestamp`_parkingspots.json" -ForegroundColor Cyan
Write-Host "  backup_$timestamp`_reservations.json" -ForegroundColor Cyan
Write-Host "  backup_$timestamp`_schedules.json" -ForegroundColor Cyan
Write-Host "  backup_$timestamp`_weeklyusages.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "Estos archivos se pueden subir a Git" -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para continuar"

