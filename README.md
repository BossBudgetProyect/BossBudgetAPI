# 🚀 BossBudget API

API REST para gestionar presupuestos personales, ingresos y gastos.

## 📋 Contenido
- [Requisitos](#requisitos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Base de Datos](#base-de-datos)
- [Endpoints](#endpoints)
- [Autenticación](#autenticación)

## ⚙️ Requisitos

- Node.js 16+
- MySQL 8.0+
- npm o yarn

## 📁 Estructura del Proyecto

```
BossBudgetAPI/
├── src/
│   ├── app.js               # Configuración de Express
│   ├── config/             
│   │   └── database.js      # Configuración de MySQL
│   ├── controllers/         # Controladores de rutas
│   ├── middlewares/         # Middlewares (auth, rate limit)
│   ├── models/             # Modelos de datos
│   ├── repositories/       # Acceso a datos
│   ├── routes/            # Definición de rutas
│   └── services/          # Lógica de negocio
├── scripts/
│   ├── setup-codespace.sh   # Script para configurar MySQL
│   └── setup-database.js    # Script para crear tablas
└── server.js               # Punto de entrada
```

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/BossBudgetAPI.git
cd BossBudgetAPI
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo .env:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=bossbudget
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

## ⚡ Configuración

### Dependencias Principales
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mysql2": "^3.15.3",
    "bcryptjs": "^3.0.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.7",
    "express-rate-limit": "^8.2.1",
    "nodemailer": "^7.0.10"
  }
}
```

### Scripts Disponibles
```bash
# Desarrollo con hot-reload
npm run dev

# Producción
npm start

# Configurar MySQL (solo Codespaces)
npm run setup:mysql

# Configurar base de datos
npm run setup:db

# Configuración completa
npm run setup:all
```

## 🗄️ Base de Datos

### Tablas Principales
- `usuario`: Gestión de usuarios
- `presupuesto`: Presupuestos principales
- `ingresos`: Registro de ingresos
- `gastos`: Registro de gastos
- `detallepresupuesto`: Detalles de presupuestos

## 📊 Conexión a Base de Datos

### Configuración de MySQL

#### 1. Configuración Local
Para conectar con una instancia local de MySQL:

```bash
# Crear la base de datos
mysql -u root -p
CREATE DATABASE bossbudget;
```

Actualizar el archivo `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=bossbudget
DB_PORT=3306
```

#### 2. Configuración Remota
Para conectar con un servidor MySQL remoto:

```env
DB_HOST=tu.servidor.mysql.com
DB_USER=usuario_remoto
DB_PASSWORD=contraseña_remota
DB_NAME=bossbudget
DB_PORT=3306
```

### Estructura de la Conexión

El proyecto utiliza `mysql2` para la conexión a la base de datos. La configuración se encuentra en `src/config/database.js`:

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Scripts de Base de Datos

#### 1. Crear Tablas
```bash
# Ejecutar script de inicialización
npm run setup:db
```

El script creará las siguientes tablas:
- `usuario` (id, nombre, email, password, createdAt)
- `presupuesto` (id, nombre, monto, usuarioId, createdAt)
- `ingresos` (id, concepto, monto, fecha, presupuestoId)
- `gastos` (id, concepto, monto, fecha, presupuestoId)
- `detallepresupuesto` (id, presupuestoId, categoria, montoAsignado)

#### 2. Migrar Base de Datos
```bash
# Ejecutar migraciones pendientes
npm run db:migrate
```

### Solución de Problemas Comunes

1. Error de conexión:
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar acceso
mysql -u root -p
```

2. Error de privilegios:
```sql
-- Otorgar privilegios al usuario
GRANT ALL PRIVILEGES ON bossbudget.* TO 'usuario'@'localhost';
FLUSH PRIVILEGES;
```

3. Error de host:
```sql
-- Permitir conexiones remotas
CREATE USER 'usuario'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON bossbudget.* TO 'usuario'@'%';
```

### Respaldos y Restauración

```bash
# Crear respaldo
mysqldump -u root -p bossbudget > backup.sql

# Restaurar respaldo
mysql -u root -p bossbudget < backup.sql
```

### Monitoreo de Conexiones

```bash
# Ver conexiones activas
SHOW PROCESSLIST;

# Ver variables de configuración
SHOW VARIABLES LIKE 'max_connections';
```

### Seguridad

- Las contraseñas nunca se almacenan en texto plano
- Se utiliza pool de conexiones para mejor rendimiento
- Las consultas utilizan parámetros preparados para prevenir SQL injection
- Se implementan timeouts para evitar conexiones colgadas

### Recomendaciones

1. Siempre usar variables de entorno para credenciales
2. Mantener actualizado MySQL a la última versión estable
3. Configurar respaldos automáticos
4. Monitorear el uso de conexiones
5. Implementar índices para mejor rendimiento
````


