# ========================================
# Plaza Coche - Sistema de Estacionamiento
# Script de inicio automático
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Plaza Coche - Sistema de Estacionamiento" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe .env
if (-not (Test-Path ".env")) {
    Write-Host "[INFO] Creando archivo .env..." -ForegroundColor Yellow
    @"
BACKEND_PORT=3000
FRONTEND_PORT=8080
MONGO_PORT=27018

MONGO_USERNAME=
MONGO_PASSWORD=
MONGO_URI=mongodb://mongodb:27017/plaza_coche

JWT_SECRET=plaza_coche_jwt_secret_key_2024_cambiar_en_produccion

NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8 -NoNewline
    Write-Host "[OK] Archivo .env creado" -ForegroundColor Green
    Write-Host ""
}

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no encontrado"
    }
} catch {
    Write-Host "[ERROR] Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Paso 1: Detener contenedores previos
Write-Host "[1/4] Deteniendo contenedores previos..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
# Paso 2: Construir e iniciar servicios
Write-Host "[2/4] Construyendo e iniciando servicios..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host ""
# Paso 3: Esperar a que los servicios estén listos
Write-Host "[3/4] Esperando a que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
# Paso 4: Restaurar datos desde backup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESTAURANDO DATOS DESDE BACKUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar el backup más reciente
$backups = Get-ChildItem -Path "db_backups" -Filter "*_users.json" | Sort-Object Name -Descending
if ($backups.Count -gt 0) {
    $latestBackup = $backups[0].Name -replace '_users.json$', ''
    Write-Host "Restaurando backup: $latestBackup" -ForegroundColor Yellow
    
    # Copiar archivos al contenedor
    docker cp "db_backups/${latestBackup}_users.json" plaza_coche_mongodb:/tmp/users.json
    docker cp "db_backups/${latestBackup}_parkingspots.json" plaza_coche_mongodb:/tmp/parkingspots.json
    docker cp "db_backups/${latestBackup}_reservations.json" plaza_coche_mongodb:/tmp/reservations.json
    
    # Importar cada colección
    docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=users --file=/tmp/users.json --jsonArray --drop 2>$null
    docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=parkingspots --file=/tmp/parkingspots.json --jsonArray --drop 2>$null
    docker exec plaza_coche_mongodb mongoimport --db=plaza_coche --collection=reservations --file=/tmp/reservations.json --jsonArray --drop 2>$null
    
    Write-Host "Datos restaurados correctamente" -ForegroundColor Green
} else {
    Write-Host "No hay backups disponibles, ejecutando init-data.js..." -ForegroundColor Yellow
    docker exec plaza_coche_backend node scripts/init-data.js
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SISTEMA LISTO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:8080" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3000" -ForegroundColor White
Write-Host "  MongoDB:   localhost:27017" -ForegroundColor White
Write-Host ""
Write-Host "  USUARIOS DE PRUEBA:" -ForegroundColor Yellow
Write-Host "  Admin: admin@iestacio.gva.es / admin123" -ForegroundColor Cyan
Write-Host "  User:  user@iestacio.gva.es / user123" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "Para detener:  docker-compose down" -ForegroundColor Gray
Write-Host ""

# Abrir navegador automáticamente
Start-Process "http://localhost:8080"

Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

