#!/bin/bash
set -e

# Verificar si el proceso de Node.js está ejecutándose
if ! pgrep -f "node" > /dev/null; then
    echo "❌ El proceso de Node.js no está ejecutándose"
    exit 1
fi

# Verificar si el puerto está escuchando
if ! netstat -tln | grep ":${PORT:-5000}" > /dev/null; then
    echo "❌ La aplicación no está escuchando en el puerto ${PORT:-5000}"
    exit 1
fi

# Verificar conexión a MySQL
if ! mysqladmin ping -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; then
    echo "❌ No hay conexión con MySQL"
    exit 1
fi

echo "✅ La aplicación está funcionando correctamente"
exit 0