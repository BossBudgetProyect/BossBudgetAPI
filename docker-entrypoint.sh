#!/bin/bash
set -e

echo "🔄 Configurando la base de datos..."
node scripts/setup-database.js

echo "🚀 Iniciando BossBudget API..."
exec npm start