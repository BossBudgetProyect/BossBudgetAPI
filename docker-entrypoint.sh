#!/bin/bash
set -e

echo "🔄 Determinando tipo de base de datos..."
if [ -z "${DB_TYPE}" ]; then
  if [ -n "${DB_HOST}" ] || [ -n "${DB_USER}" ] || [ -n "${DB_PASSWORD}" ] || [ -n "${DB_NAME}" ]; then
    export DB_TYPE=mysql
  else
    export DB_TYPE=sqlite
  fi
fi

echo "🔧 DB_TYPE=${DB_TYPE}"

if [ "${DB_TYPE}" != "sqlite" ]; then
  echo "🔄 Verificando conexión a MySQL..."
  until mysqladmin ping -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; do
      echo "⏳ Esperando a MySQL..."
      sleep 2
  done
  echo "✅ MySQL conectado exitosamente"
fi

echo "🔄 Ejecutando migraciones de la base de datos..."
if [ -f scripts/setup-database.js ]; then
    node scripts/setup-database.js
else
    echo "⚠️  script setup-database.js no encontrado, omitiendo migraciones"
fi

echo "🚀 Iniciando BossBudget API..."
exec npm start
