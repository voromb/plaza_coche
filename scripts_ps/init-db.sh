#!/bin/bash

echo "========================================"
echo "  Inicializando Base de Datos"
echo "========================================"
echo ""

echo "Ejecutando script de inicialización..."
docker exec plaza_coche_backend node scripts/init-data.js

echo ""
echo "========================================"
echo "  Base de datos inicializada"
echo "========================================"
echo ""
echo "Usuarios creados:"
echo "  Admin: admin@iestacio.gva.es / admin123"
echo "  User:  user@iestacio.gva.es / user123"
echo ""
echo "6 plazas de estacionamiento creadas"
echo ""

