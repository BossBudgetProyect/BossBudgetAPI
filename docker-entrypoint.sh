#!/bin/bash
set -e

echo "🔄 Verificando conexión a MySQL..."
until mysqladmin ping -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; do
    echo "⏳ Esperando a MySQL..."
    sleep 2
done
echo "✅ MySQL conectado exitosamente"

echo "🔄 Ejecutando migraciones de la base de datos..."
if [ -f scripts/setup-database.js ]; then
    node scripts/setup-database.js
else
    echo "⚠️  script setup-database.js no encontrado, omitiendo migraciones"
fi

echo "🚀 Iniciando BossBudget API..."
exec npm start
