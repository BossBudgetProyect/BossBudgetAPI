#!/bin/bash
set -e

echo "🔄 Verificando conexión a MySQL..."
until mysqladmin ping -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; do
    echo "⏳ Esperando a MySQL..."
    sleep 2
done
echo "✅ MySQL conectado exitosamente"

echo "🔄 Ejecutando migraciones de la base de datos..."
node scripts/setup-database.js

echo "🚀 Iniciando BossBudget API..."
exec npm start