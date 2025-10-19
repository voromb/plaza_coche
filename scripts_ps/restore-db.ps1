# ========================================
# Restaurar Base de Datos
# Importa desde archivos JSON
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupTimestamp
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Restaurar Base de Datos" -ForegroundColor Cyan
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

$backupDir = "db_backups"

# Si no se especificó timestamp, mostrar backups disponibles
if (-not $BackupTimestamp) {
    Write-Host "Backups disponibles:" -ForegroundColor Yellow
    Write-Host ""
    
    $backups = Get-ChildItem -Path $backupDir -Filter "*_users.json" | ForEach-Object {
        $_.Name -replace '_users.json$', ''
    } | Sort-Object -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "No hay backups disponibles" -ForegroundColor Red
        Write-Host ""
        Write-Host "Usa: .\backup-db.ps1 para crear uno" -ForegroundColor Yellow
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        Write-Host "  [$i] $($backups[$i])" -ForegroundColor Cyan
    }
    
    Write-Host ""
    $selection = Read-Host "Selecciona el número del backup a restaurar"
    
    if ($selection -match '^\d+$' -and [int]$selection -lt $backups.Count) {
        $BackupTimestamp = $backups[[int]$selection]
    } else {
        Write-Host "[ERROR] Selección inválida" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

$backupPath = "$backupDir/$BackupTimestamp"

# Verificar que existan los archivos
if (-not (Test-Path "$backupPath`_users.json")) {
    Write-Host "[ERROR] No se encontró el backup: $BackupTimestamp" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto eliminará los datos actuales" -ForegroundColor Yellow
$confirm = Read-Host "¿Continuar? (s/n)"

if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "Operación cancelada" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 0
}

Write-Host ""
Write-Host "Restaurando base de datos..." -ForegroundColor Yellow
Write-Host ""

# Copiar archivos al contenedor
Write-Host "  → Preparando archivos..." -ForegroundColor White
docker cp "$backupPath`_users.json" plaza_coche_mongodb:/tmp/users.json
docker cp "$backupPath`_parkingspots.json" plaza_coche_mongodb:/tmp/parkingspots.json
docker cp "$backupPath`_reservations.json" plaza_coche_mongodb:/tmp/reservations.json

# Importar cada colección
Write-Host "  → Importando usuarios..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=users --file=/tmp/users.json --jsonArray --drop 2>$null

Write-Host "  → Importando plazas..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=parkingspots --file=/tmp/parkingspots.json --jsonArray --drop 2>$null

Write-Host "  → Importando reservas..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=reservations --file=/tmp/reservations.json --jsonArray --drop 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Restauración Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Read-Host "Presiona Enter para continuar"

