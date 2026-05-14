#!/bin/bash

echo "🔧 Configurando MySQL en Codespaces..."

# Paso 1: Actualizar e instalar MySQL
echo "📦 Actualizando e instalando MySQL..."
sudo apt update
sudo apt install mysql-server -y

# Paso 2: Iniciar MySQL
echo "🚀 Iniciando MySQL service..."
sudo service mysql start

# Paso 3: Configurar password de root
echo "⚙️ Configurando usuario root..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';"

# ✅ NUEVO: Instalar dependencias (esto ejecutará postinstall automáticamente)
echo "📦 Instalando dependencias y configurando base de datos..."
npm install

echo "✅ MySQL instalado y configurado en Codespaces"
echo "📊 Ahora ejecuta: npm run setup:db"