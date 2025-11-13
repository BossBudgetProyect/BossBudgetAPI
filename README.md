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

 
# BossBudget API

API REST profesional para la gestión de presupuestos personales, ingresos, gastos y usuarios. Proporciona endpoints para autenticación, gestión de usuarios, presupuestos, registros de ingresos/gastos y recuperación de contraseñas.

## 📌 Resumen

BossBudget API permite a aplicaciones cliente (web o móvil) administrar finanzas personales: crear presupuestos, registrar ingresos y gastos, y organizar detalles por categorías. Ofrece autenticación, control de acceso y persistencia en MySQL.

Tecnologías principales:

- Node.js
- Express.js
- MySQL (con `mysql2`)
- Autenticación JWT (si aplica)
- Hashing de contraseñas con `bcrypt` (si aplica)
- Manejo de variables de entorno con `dotenv` (si aplica)

---

## 🏗️ Arquitectura

El proyecto sigue un patrón similar a MVC (Modelo - Controlador - Rutas) con capas de servicios/repositorios para separar la lógica de negocio del acceso a datos.

Flujo de petición-respuesta (texto):

Cliente → Rutas (Express Router) → Middlewares (auth, rate-limit, validaciones) → Controladores → Servicios / Repositorios → MySQL

Conexión a MySQL: el pool y la configuración se encuentran en `src/config/database.js` y las consultas se realizan desde modelos o repositorios en `src/models/` y `src/repositories/`.

---

## 📁 Estructura de carpetas (adaptada al proyecto)

```
. 
├── docker-entrypoint.sh
├── Dockerfile
├── README.md
├── package.json
├── server.js                # Punto de entrada que arranca la app
├── src/
│   ├── app.js               # Configuración principal de Express (middlewares, routes)
│   ├── config/
│   │   └── database.js      # Pool / conexión a MySQL
│   ├── controllers/         # Controladores por recurso (auth, usuarios, gastos...)
│   ├── middlewares/         # middlewares: auth, rateLimit, etc.
│   ├── models/              # Modelos (esquemas/consultas)
│   ├── repositories/        # Acceso a la BD (queries agrupadas)
│   ├── routes/              # Definición de rutas (auth.js, gastos.js...)
│   └── services/            # Lógica de negocio (uso por controladores)
├── scripts/                 # Scripts de utilidades (setup database, codespace)
└── uploads/                 # Archivos subidos (si aplica)
```

Responsabilidad breve de carpetas/archivos:

- `src/app.js`: configura Express, middlewares globales y montaje de rutas.
- `server.js`: crea el servidor y lo pone a escuchar en el puerto configurado.
- `src/config/database.js`: crea el pool de conexiones a MySQL.
- `src/routes/`: define puntos de entrada HTTP (por ejemplo `routes/auth.js`).
- `src/controllers/`: recibe la petición, valida y llama a servicios.
- `src/services/`: contiene la lógica de negocio reutilizable.
- `src/repositories/` y `src/models/`: encapsulan consultas SQL o llamadas al ORM.
- `src/middlewares/`: auth JWT, rate limiting, validaciones y manejo de errores.

---

## ⚙️ Instalación y configuración

### Requisitos previos

- Node.js v16+ (recomendado LTS)
- npm (o yarn)
- MySQL 5.7+ / 8.0+

### Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd BossBudgetAPI
```

### Instalar dependencias

```bash
npm install
```

### Variables de entorno

Crea un archivo `.env` en la raíz con al menos estas variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=bossbudget
DB_PORT=3306
PORT=3000
JWT_SECRET=clave-super-secreta
```

Nota: el proyecto ya contiene `src/config/database.js` para leer estas variables y crear el pool de conexiones.

### Comandos disponibles

```bash
# Modo desarrollo (con nodemon si está configurado)
npm run dev

# Iniciar en producción
npm start

# Scripts de ayuda (si existen en package.json)
npm run setup:db       # inicializa la BD con tablas (ver carpeta scripts)
npm run setup:codespace
```

---

## 🔌 Endpoints principales (detectados en `src/routes/`)

El repositorio contiene las siguientes rutas (archivos):

- `routes/auth.js` → Autenticación (login, registro, logout)
- `routes/users.js` → Endpoints CRUD para usuarios
- `routes/gastos.js` → CRUD de gastos
- `routes/ingresos.js` → CRUD de ingresos
- `routes/presupuestos.js` → Gestión de presupuestos
- `routes/password.js` → Reset / recuperación de contraseña

Ruta base propuesta: `/api/` (por ejemplo `/api/auth/login`). Revisa `src/routes/*.js` para la ruta exacta de cada controlador.

Ejemplos de endpoints (ajusta según tu implementación):

- POST `/api/auth/login` — Autenticación por email/contraseña
- POST `/api/auth/register` — Crear nuevo usuario
- GET `/api/users` — Obtener lista de usuarios (protegido)
- GET `/api/gastos` — Obtener gastos del usuario autenticado
- POST `/api/gastos` — Crear gasto
- GET `/api/ingresos` — Obtener ingresos
- POST `/api/presupuestos` — Crear presupuesto
- POST `/api/password/forgot` — Solicitar recuperación
- POST `/api/password/reset` — Resetear contraseña con token

### Ejemplo de petición

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

Respuesta JSON (ejemplo):

```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
]
```

---

## ✅ Autenticación y seguridad

- Se recomienda usar JWT para proteger rutas privadas (`Authorization: Bearer <token>`).
- Las contraseñas deben almacenarse hasheadas con `bcrypt` o `bcryptjs`.
- Usar middlewares para manejo centralizado de errores y validaciones.
- Limitar peticiones con `express-rate-limit` para mitigar abuso.

---

## 🧪 Pruebas

No se detectó una suite de tests en el repositorio. Para agregar pruebas recomendamos:

- Jest + Supertest para pruebas de integración de endpoints.

Comandos sugeridos:

```bash
npm install --save-dev jest supertest

# Añadir script en package.json:
"test": "jest --runInBand"

# Ejecutar tests
npm test
```

---

## 📦 Despliegue

Opciones comunes:

- Docker / docker-compose
- Plataformas: Railway, Render, Heroku, AWS Elastic Beanstalk, EC2

Ejemplo mínimo `Dockerfile` (ya existe uno en el repo):

```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

Ejemplo `docker-compose.yml` (sugerido):

```yaml
version: '3.8'
services:
  db:
    image: mysql:8
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 1234
      MYSQL_DATABASE: bossbudget
    ports:
      - '3306:3306'
    volumes:
      - db-data:/var/lib/mysql

  api:
    build: .
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: 1234
      DB_NAME: bossbudget
      PORT: 3000
    ports:
      - '3000:3000'

volumes:
  db-data:
```

Variables de entorno en producción: configura `DB_*`, `JWT_SECRET` y cualquier credencial externa en el servicio de despliegue (Railway/Render/Heroku Secrets, AWS Parameter Store o similar).

---

## ✅ Buenas prácticas y estándares

- Mantener consistencia en rutas: `/api/v1/...` si planeas versionar.
- Manejar errores desde un middleware centralizado y devolver códigos HTTP correctos (400, 401, 403, 404, 500).
- Validar entradas (body/params) con `Joi` o `express-validator`.
- Usar ESLint y Prettier para consistencia de código.
- No exponer credenciales en el repositorio; emplear `.env` y secretos de CI/CD.

---

## 🤝 Contribución

1. Haz fork del repositorio
2. Crea una rama (feature/my-feature)
3. Haz commits claros (separados por responsabilidad)
4. Abre un Pull Request describiendo los cambios

Convenciones recomendadas: Conventional Commits (feat, fix, docs, chore).

---

## 📝 Licencia

Este proyecto se publica bajo la licencia MIT. Consulta el archivo `LICENSE` si está presente.

---

## 📬 Contacto / Créditos

- Equipo: BossBudgetProyect
- Repositorio: 
- Autor / Mantenimiento: 



