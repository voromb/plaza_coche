# ========================================
# Restaurar Base de Datos
# Importa desde archivos JSON
# ========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$DateFolder
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

# Si se especificó carpeta como parámetro, usar esa
if ($DateFolder) {
    $selectedFolder = $DateFolder
} else {
    # Mostrar carpetas disponibles por fecha
    Write-Host "Carpetas de backups disponibles:" -ForegroundColor Yellow
    Write-Host ""
    
    $folders = Get-ChildItem -Path $backupDir -Directory -ErrorAction SilentlyContinue | Sort-Object -Descending
    
    if ($folders.Count -eq 0) {
        Write-Host "No hay carpetas de backup disponibles" -ForegroundColor Red
        Write-Host ""
        Write-Host "Usa: .\backup-db.ps1 para crear uno" -ForegroundColor Yellow
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    
    for ($i = 0; $i -lt $folders.Count; $i++) {
        Write-Host "  [$i] $($folders[$i].Name)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    $selection = Read-Host "Selecciona la carpeta (número)"
    
    if ($selection -match '^\d+$' -and [int]$selection -lt $folders.Count) {
        $selectedFolder = $folders[[int]$selection].Name
    } else {
        Write-Host "[ERROR] Selección inválida" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

# Ahora buscar el backup más nuevo en la carpeta seleccionada
$targetDir = Join-Path -Path $backupDir -ChildPath $selectedFolder

if (-not (Test-Path $targetDir)) {
    Write-Host "[ERROR] La carpeta no existe: $targetDir" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Obtener el backup más nuevo de esa carpeta
$backups = Get-ChildItem -Path $targetDir -Filter "*_users.json" | Sort-Object -Descending

if ($backups.Count -eq 0) {
    Write-Host "[ERROR] No hay backups en: $targetDir" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

$backupName = $backups[0].Name -replace '_users.json$', ''
$BackupTimestamp = Join-Path -Path $selectedFolder -ChildPath $backupName
Write-Host "Usando backup más reciente: $BackupTimestamp" -ForegroundColor Green

$backupPath = Join-Path -Path $backupDir -ChildPath $BackupTimestamp

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
docker cp "$backupPath`_schedules.json" plaza_coche_mongodb:/tmp/schedules.json 2>$null
docker cp "$backupPath`_weeklyusages.json" plaza_coche_mongodb:/tmp/weeklyusages.json 2>$null

# Importar cada colección
Write-Host "  → Importando usuarios..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=users --file=/tmp/users.json --jsonArray --drop 2>$null

Write-Host "  → Importando plazas..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=parkingspots --file=/tmp/parkingspots.json --jsonArray --drop 2>$null

Write-Host "  → Importando reservas..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=reservations --file=/tmp/reservations.json --jsonArray --drop 2>$null

Write-Host "  → Importando horarios..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=schedules --file=/tmp/schedules.json --jsonArray --drop 2>$null

Write-Host "  → Importando uso del cargador..." -ForegroundColor White
docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=weeklyusages --file=/tmp/weeklyusages.json --jsonArray --drop 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Restauración Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Read-Host "Presiona Enter para continuar"

