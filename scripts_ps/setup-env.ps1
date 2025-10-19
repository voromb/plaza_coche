# ========================================
# Configuración de Variables de Entorno
# Plaza Coche - Sistema de Estacionamiento
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuración de Variables de Entorno" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Contenido del archivo .env.example
$envExampleContent = @"
# ===========================================
# CONFIGURACIÓN PLAZA COCHE - EJEMPLO
# ===========================================
# Copia este archivo a .env y configura tus valores

# Puerto del Backend
BACKEND_PORT=3000

# Puerto del Frontend
FRONTEND_PORT=8080

# Puerto de MongoDB
MONGO_PORT=27017

# Credenciales MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=cambiar_password_seguro

# URI de Conexión MongoDB (sin autenticación por defecto para desarrollo)
MONGO_URI=mongodb://mongodb:27017/plaza_coche

# JWT Secret (CAMBIAR EN PRODUCCIÓN - usar valor aleatorio largo)
JWT_SECRET=cambiar_por_secreto_muy_largo_y_aleatorio_en_produccion

# Entorno (development, production)
NODE_ENV=development
"@

# Contenido del archivo .env
$envContent = @"
# ===========================================
# CONFIGURACIÓN PLAZA COCHE - DESARROLLO
# ===========================================

# Puerto del Backend
BACKEND_PORT=3000

# Puerto del Frontend
FRONTEND_PORT=8080

# Puerto de MongoDB
MONGO_PORT=27017

# Credenciales MongoDB (sin autenticación para desarrollo local)
MONGO_USERNAME=
MONGO_PASSWORD=

# URI de Conexión MongoDB
MONGO_URI=mongodb://mongodb:27017/plaza_coche

# JWT Secret - CAMBIAR ESTE VALOR EN PRODUCCIÓN
JWT_SECRET=plaza_coche_jwt_secret_key_2024_cambiar_en_produccion

# Entorno
NODE_ENV=development
"@

# Crear .env.example
try {
    $envExampleContent | Out-File -FilePath ".env.example" -Encoding UTF8 -NoNewline
    Write-Host "[✓] Archivo .env.example creado" -ForegroundColor Green
} catch {
    Write-Host "[✗] Error al crear .env.example: $_" -ForegroundColor Red
    exit 1
}

# Crear .env
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "[✓] Archivo .env creado" -ForegroundColor Green
} catch {
    Write-Host "[✗] Error al crear .env: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Archivos de entorno creados" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  .env.example  - Plantilla (subir a Git)" -ForegroundColor Yellow
Write-Host "  .env          - Valores reales (proyecto educativo)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para personalizar, edita el archivo .env:" -ForegroundColor White
Write-Host "  notepad .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

