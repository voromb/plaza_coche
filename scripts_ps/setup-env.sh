#!/bin/bash

echo "========================================"
echo "  Configuración de Variables de Entorno"
echo "========================================"
echo ""

# Crear archivo .env.example
cat > .env.example << 'EOF'
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
EOF

echo "[OK] Archivo .env.example creado"

# Crear archivo .env para desarrollo
cat > .env << 'EOF'
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
EOF

echo "[OK] Archivo .env creado"

echo ""
echo "========================================"
echo "  Archivos de entorno creados"
echo "========================================"
echo ""
echo "  .env.example  - Plantilla (subir a Git)"
echo "  .env          - Valores reales (NO subir a Git)"
echo ""
echo "Para personalizar, edita el archivo .env:"
echo "  nano .env"
echo ""

