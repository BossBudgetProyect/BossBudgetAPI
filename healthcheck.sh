#!/bin/bash
set -e

# Verificar si el proceso de Node.js está ejecutándose
if ! pgrep -f "node" > /dev/null; then
    echo "❌ El proceso de Node.js no está ejecutándose"
    exit 1
fi

# Verificar si el puerto está escuchando
if ! netstat -tln | grep ":${PORT:-3000}" > /dev/null; then
    echo "❌ La aplicación no está escuchando en el puerto ${PORT:-3000}"
    exit 1
fi

# Verificar conexión a MySQL o fallback a SQLite
if [ "${DB_TYPE:-mysql}" = "sqlite" ]; then
    SQLITE_FILE="${SQLITE_FILE:-./database.sqlite}"
    if [ ! -f "$SQLITE_FILE" ]; then
        echo "❌ No se encontró el archivo de SQLite: $SQLITE_FILE"
        exit 1
    fi
    echo "✅ La aplicación está funcionando correctamente con SQLite"
    exit 0
fi

if mysqladmin ping -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; then
    echo "✅ La aplicación está funcionando correctamente con MySQL"
    exit 0
fi

if [ -f "${SQLITE_FILE:-./database.sqlite}" ]; then
    echo "✅ No hay MySQL pero existe SQLite, la aplicación puede usar SQLite"
    exit 0
fi

echo "❌ No hay conexión con MySQL y no existe SQLite"
exit 1