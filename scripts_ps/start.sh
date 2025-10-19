#!/bin/bash

echo "========================================"
echo "  Plaza Coche - Sistema de Estacionamiento"
echo "========================================"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker no está instalado"
    echo "Por favor instala Docker desde: https://www.docker.com/"
    exit 1
fi

# Verificar si docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "[ERROR] Docker Compose no está instalado"
    echo "Por favor instala Docker Compose"
    exit 1
fi

echo "[1/3] Deteniendo contenedores previos..."
docker-compose down

echo ""
echo "[2/3] Construyendo e iniciando servicios..."
docker-compose up --build -d

echo ""
echo "[3/3] Esperando a que los servicios estén listos..."
sleep 15

echo ""
echo "========================================"
echo "  INICIALIZANDO DATOS DE PRUEBA"
echo "========================================"
echo ""
docker exec plaza_coche_backend node scripts/init-data.js

echo ""
echo "========================================"
echo "  SISTEMA LISTO"
echo "========================================"
echo ""
echo "  Frontend:  http://localhost:8080"
echo "  Backend:   http://localhost:3000"
echo "  MongoDB:   localhost:27017"
echo ""
echo "  USUARIOS DE PRUEBA:"
echo "  Admin: admin@iestacio.gva.es / admin123"
echo "  User:  user@iestacio.gva.es / user123"
echo ""
echo "========================================"
echo ""
echo "Para ver logs: docker-compose logs -f"
echo "Para detener:  docker-compose down"
echo ""

# Intentar abrir el navegador (funciona en la mayoría de sistemas)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080
elif command -v open &> /dev/null; then
    open http://localhost:8080
fi

