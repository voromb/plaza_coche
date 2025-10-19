# ========================================
# Inicialización de Base de Datos
# Plaza Coche
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Inicializando Base de Datos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Ejecutando script de inicialización..." -ForegroundColor Yellow
docker exec plaza_coche_backend node scripts/init-data.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Base de datos inicializada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Usuarios creados:" -ForegroundColor White
Write-Host "  Admin: admin@iestacio.gva.es / admin123" -ForegroundColor Cyan
Write-Host "  User:  user@iestacio.gva.es / user123" -ForegroundColor Cyan
Write-Host ""
Write-Host "6 plazas de estacionamiento creadas" -ForegroundColor Green
Write-Host ""

Read-Host "Presiona Enter para continuar"

