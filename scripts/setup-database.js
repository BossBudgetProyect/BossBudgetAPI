// scripts/setup-database.js
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Determinar el tipo de base de datos
const dbType = process.env.DB_TYPE || 'sqlite'; // 'mysql' o 'sqlite'

async function setupDatabase() {
    console.log('═'.repeat(50));
    console.log(`🔍 Configurando base de datos: ${dbType.toUpperCase()}`);
    console.log('═'.repeat(50));

    try {
        if (dbType === 'sqlite') {
            await setupSQLite();
        } else {
            await setupMySQL();
        }

        console.log('\n🎉 Base de datos configurada exitosamente!');
        console.log('📋 Tablas creadas: usuario, presupuesto, gastos, ingresos, etc.');
        console.log('👤 Usuario de prueba: testuser / contraseña: (hasheada)');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

async function setupSQLite() {
    const dbPath = path.join(__dirname, '../database.sqlite');
    const db = new sqlite3.Database(dbPath);

    console.log('🔧 Configurando base de datos SQLite local...');

    // Habilitar foreign keys
    await runSQLite(db, 'PRAGMA foreign_keys = ON');

    console.log('📋 Creando tablas...');

    // Crear todas las tablas para SQLite
    await createAllTablesSQLite(db);

    console.log('📊 Insertando datos básicos...');
    await insertBasicDataSQLite(db);

    db.close();
    console.log('✅ Base de datos SQLite configurada');
}

async function setupMySQL() {
    // Lógica original de MySQL
    const isProduction = process.env.NODE_ENV === 'production';
    const isCodespaces = process.env.CODESPACES === 'true' || process.env.DB_HOST === 'localhost';

    console.log(`🔍 Entorno detectado: ${isProduction ? '🏢 PRODUCCIÓN (Universidad)' : '💻 DESARROLLO (Codespaces)'} - MySQL`);

    let connection;

    try {
        if (isProduction) {
            console.log('📡 Conectando a base de datos de la UNIVERSIDAD...');
            console.log(`   Host: ${process.env.DB_HOST}`);
            console.log(`   Base: ${process.env.DB_NAME}`);

            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 3306
            });

            console.log('✅ CONEXIÓN EXITOSA a base de datos de la universidad');

            const [tables] = await connection.query(`
                SELECT COUNT(*) as total
                FROM information_schema.tables
                WHERE table_schema = ?
            `, [process.env.DB_NAME]);

            if (tables[0].total === 0) {
                console.warn('⚠️  ADVERTENCIA: No hay tablas en la base de datos');
                console.warn('   Debes crearlas manualmente o pedir al administrador');
            } else {
                console.log(`📊 Base de datos lista con ${tables[0].total} tablas`);
            }

        } else {
            console.log('🔧 Configurando base de datos LOCAL en MySQL...');

            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password'
            });

            console.log('✅ Conectado a MySQL local');

            const dbName = process.env.DB_NAME || 'bossbudget';
            await connection.execute(
                `CREATE DATABASE IF NOT EXISTS ${dbName}
                 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
            );
            console.log(`✅ Base de datos '${dbName}' creada/verificada`);

            await connection.end();

            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password',
                database: dbName,
                multipleStatements: true
            });

            console.log('📋 Creando tablas...');
            await createAllTablesMySQL(connection);

            console.log('📊 Insertando datos básicos...');
            await insertBasicDataMySQL(connection);
        }

    } catch (error) {
        console.error('❌ ERROR en MySQL:', error.message);

        if (!isProduction) {
            console.error('\n🔧 SOLUCIÓN para desarrollo:');
            console.error('1. Ejecuta: sudo service mysql start');
            console.error('2. Verifica que MySQL esté instalado');
        }

        throw error;
    } finally {
        if (connection) await connection.end();
    }
}

// Función helper para SQLite
function runSQLite(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// ========== FUNCIONES DE CREACIÓN DE TABLAS ==========
async function createAllTablesSQLite(db) {
    // TABLA usuario
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS usuario (
            Correo TEXT PRIMARY KEY,
            Nombres TEXT,
            Apellidos TEXT,
            Contraseña TEXT NOT NULL,
            Profesion TEXT,
            FechaDeNacimiento TEXT,
            Expectativas TEXT,
            NombreUsuario TEXT NOT NULL UNIQUE,
            Foto TEXT,
            rol TEXT NOT NULL DEFAULT 'userN'
        )
    `);

    // TABLA password_reset_tokens
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            Correo TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            FOREIGN KEY (Correo) REFERENCES usuario (Correo) ON DELETE CASCADE
        )
    `);

    // TABLA tipopresupuesto
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS tipopresupuesto (
            idTipoPresupuesto INTEGER PRIMARY KEY,
            TipoDePresupuesto TEXT
        )
    `);

    // TABLA presupuesto
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS presupuesto (
            idPresupuesto INTEGER PRIMARY KEY AUTOINCREMENT,
            Fecha TEXT,
            idTipoPresupuesto INTEGER,
            Dinero REAL,
            Ahorros REAL,
            NombreUsuario TEXT,
            FOREIGN KEY (idTipoPresupuesto) REFERENCES tipopresupuesto (idTipoPresupuesto),
            FOREIGN KEY (NombreUsuario) REFERENCES usuario (NombreUsuario)
        )
    `);

    // TABLA detallepresupuesto
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS detallepresupuesto (
            idPresupuesto INTEGER,
            idDetalle INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria TEXT,
            tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('Ingreso','Gasto')),
            destino TEXT NOT NULL CHECK (destino IN ('presupuestado','real')),
            monto REAL NOT NULL,
            fecha_inicio TEXT,
            fecha_fin TEXT,
            nombre TEXT,
            FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
        )
    `);

    // TABLA gastos
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS gastos (
            idGastos INTEGER PRIMARY KEY AUTOINCREMENT,
            idPresupuesto INTEGER NOT NULL,
            FechaDeRegistro TEXT,
            Monto REAL,
            TipoDeMonto TEXT CHECK (TipoDeMonto IN ('Efectivo','Tarjeta Debito','Tarjeta credito','Cheque','Billeteras virtuales')),
            Descripcion TEXT,
            TipoDeMontoDetalle TEXT,
            FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
        )
    `);

    // TABLA ingresos
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS ingresos (
            idIngresos INTEGER PRIMARY KEY AUTOINCREMENT,
            idPresupuesto INTEGER NOT NULL,
            FechaDeRegistro TEXT,
            Monto REAL,
            TipoDeMonto TEXT CHECK (TipoDeMonto IN ('Efectivo','Tarjeta Debito','Tarjeta credito','Cheque','Billeteras virtuales')),
            Descripcion TEXT,
            TipoDeMontoDetalle TEXT,
            FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
        )
    `);

    // TABLA telefonos
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS telefonos (
            idTelefono INTEGER PRIMARY KEY,
            Numero TEXT,
            Correo TEXT NOT NULL,
            FOREIGN KEY (Correo) REFERENCES usuario (Correo)
        )
    `);

    // TABLA recordatorios
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS recordatorios (
            idRecordatorios INTEGER PRIMARY KEY,
            Comentario TEXT,
            NombreUsuario TEXT NOT NULL,
            FOREIGN KEY (NombreUsuario) REFERENCES usuario (NombreUsuario)
        )
    `);

    // TABLA tiposderecordatorios
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS tiposderecordatorios (
            idTiposDeRecordatorios INTEGER PRIMARY KEY,
            TipoDeRecordatorio TEXT,
            idRecordatorios INTEGER NOT NULL,
            FOREIGN KEY (idRecordatorios) REFERENCES recordatorios (idRecordatorios)
        )
    `);

    // TABLA tipodecredito
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS tipodecredito (
            idTipoDeCredito INTEGER PRIMARY KEY,
            TipoDeCredito TEXT
        )
    `);

    // TABLA creditos
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS creditos (
            idCreditos INTEGER PRIMARY KEY,
            idPresupuesto INTEGER NOT NULL,
            RangoInicial TEXT,
            RangoFinal TEXT,
            MontoTotal REAL,
            idTipoDeCredito INTEGER NOT NULL,
            FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto),
            FOREIGN KEY (idTipoDeCredito) REFERENCES tipodecredito (idTipoDeCredito)
        )
    `);

    // TABLA pagodecredito
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS pagodecredito (
            idPagoDeCredito INTEGER PRIMARY KEY,
            TipoDePago TEXT,
            idCreditos INTEGER NOT NULL,
            AccionRealizada TEXT,
            FOREIGN KEY (idCreditos) REFERENCES creditos (idCreditos)
        )
    `);

    // TABLA cuentas
    await runSQLite(db, `
        CREATE TABLE IF NOT EXISTS cuentas (
            idCuentas INTEGER PRIMARY KEY,
            Banco TEXT,
            Monto REAL,
            idPresupuesto INTEGER NOT NULL,
            FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto)
        )
    `);

    console.log('✅ Tablas creadas/verificadas en SQLite');
}

async function createAllTablesMySQL(connection) {
    // Código original de MySQL
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS usuario (
            Correo VARCHAR(120) NOT NULL,
            Nombres VARCHAR(70) DEFAULT NULL,
            Apellidos VARCHAR(70) DEFAULT NULL,
            Contraseña VARCHAR(60) NOT NULL,
            Profesion VARCHAR(40) DEFAULT NULL,
            FechaDeNacimiento DATE DEFAULT NULL,
            Expectativas TEXT,
            NombreUsuario VARCHAR(50) NOT NULL,
            Foto VARCHAR(255) DEFAULT NULL,
            rol ENUM('admi','userN') NOT NULL DEFAULT 'userN',
            PRIMARY KEY (Correo),
            UNIQUE KEY NombreUsuario (NombreUsuario)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT NOT NULL AUTO_INCREMENT,
            Correo VARCHAR(120) NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY Correo (Correo),
            CONSTRAINT password_reset_tokens_ibfk_1 FOREIGN KEY (Correo) REFERENCES usuario (Correo) ON DELETE CASCADE,
            UNIQUE KEY token_unique (token)
        ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS tipopresupuesto (
            idTipoPresupuesto INT NOT NULL,
            TipoDePresupuesto VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (idTipoPresupuesto)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS presupuesto (
            idPresupuesto INT NOT NULL AUTO_INCREMENT,
            Fecha DATE DEFAULT NULL,
            idTipoPresupuesto INT DEFAULT NULL,
            Dinero DECIMAL(10,0) DEFAULT NULL,
            Ahorros DECIMAL(10,0) DEFAULT NULL,
            NombreUsuario VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (idPresupuesto),
            KEY idTipoPresupuesto (idTipoPresupuesto),
            KEY NombreUsuario (NombreUsuario),
            CONSTRAINT presupuesto_ibfk_2 FOREIGN KEY (idTipoPresupuesto) REFERENCES tipopresupuesto (idTipoPresupuesto),
            CONSTRAINT presupuesto_ibfk_3 FOREIGN KEY (NombreUsuario) REFERENCES usuario (NombreUsuario)
        ) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS detallepresupuesto (
            idPresupuesto INT DEFAULT NULL,
            idDetalle INT NOT NULL AUTO_INCREMENT,
            categoria VARCHAR(50) DEFAULT NULL,
            tipo_movimiento ENUM('Ingreso','Gasto') NOT NULL,
            destino ENUM('presupuestado','real') NOT NULL,
            monto DECIMAL(10,2) NOT NULL,
            fecha_inicio DATE DEFAULT NULL,
            fecha_fin DATE DEFAULT NULL,
            nombre VARCHAR(100) DEFAULT NULL,
            PRIMARY KEY (idDetalle),
            KEY idPresupuesto (idPresupuesto),
            CONSTRAINT fk_detallepresupuesto_presupuesto FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
        ) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS gastos (
            idGastos INT NOT NULL AUTO_INCREMENT,
            idPresupuesto INT NOT NULL,
            FechaDeRegistro DATE DEFAULT NULL,
            Monto DECIMAL(10,0) DEFAULT NULL,
            TipoDeMonto ENUM('Efectivo','Tarjeta Debito','Tarjeta credito','Cheque','Billeteras virtuales') DEFAULT NULL,
            Descripcion TEXT,
            TipoDeMontoDetalle VARCHAR(100) DEFAULT NULL,
            PRIMARY KEY (idGastos),
            KEY idPresupuesto (idPresupuesto),
            CONSTRAINT fk_gastos_presupuesto FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
        ) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS ingresos (
            idIngresos INT NOT NULL AUTO_INCREMENT,
            idPresupuesto INT NOT NULL,
            FechaDeRegistro DATE DEFAULT NULL,
            Monto DECIMAL(10,0) DEFAULT NULL,
            TipoDeMonto ENUM('Efectivo','Tarjeta Debito','Tarjeta credito','Cheque','Billeteras virtuales') DEFAULT NULL,
            Descripcion TEXT,
            TipoDeMontoDetalle VARCHAR(100) DEFAULT NULL,
            PRIMARY KEY (idIngresos),
            KEY idPresupuesto (idPresupuesto),
            CONSTRAINT fk_ingresos_presupuesto FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
        ) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS telefonos (
            idTelefono INT NOT NULL,
            Numero VARCHAR(15) DEFAULT NULL,
            Correo VARCHAR(120) NOT NULL,
            PRIMARY KEY (idTelefono),
            KEY Correo (Correo),
            CONSTRAINT telefonos_ibfk_1 FOREIGN KEY (Correo) REFERENCES usuario (Correo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS recordatorios (
            idRecordatorios INT NOT NULL,
            Comentario VARCHAR(120) DEFAULT NULL,
            NombreUsuario VARCHAR(50) NOT NULL,
            PRIMARY KEY (idRecordatorios),
            KEY NombreUsuario (NombreUsuario),
            CONSTRAINT recordatorios_ibfk_1 FOREIGN KEY (NombreUsuario) REFERENCES usuario (NombreUsuario)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS tiposderecordatorios (
            idTiposDeRecordatorios INT NOT NULL,
            TipoDeRecordatorio VARCHAR(50) DEFAULT NULL,
            idRecordatorios INT NOT NULL,
            PRIMARY KEY (idTiposDeRecordatorios),
            KEY idRecordatorios (idRecordatorios),
            CONSTRAINT tiposderecordatorios_ibfk_1 FOREIGN KEY (idRecordatorios) REFERENCES recordatorios (idRecordatorios)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS tipodecredito (
            idTipoDeCredito INT NOT NULL,
            TipoDeCredito VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (idTipoDeCredito)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS creditos (
            idCreditos INT NOT NULL,
            idPresupuesto INT NOT NULL,
            RangoInicial DATE DEFAULT NULL,
            RangoFinal DATE DEFAULT NULL,
            MontoTotal DECIMAL(10,0) DEFAULT NULL,
            idTipoDeCredito INT NOT NULL,
            PRIMARY KEY (idCreditos),
            KEY idPresupuesto (idPresupuesto),
            KEY idTipoDeCredito (idTipoDeCredito),
            CONSTRAINT creditos_ibfk_1 FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto),
            CONSTRAINT creditos_ibfk_2 FOREIGN KEY (idTipoDeCredito) REFERENCES tipodecredito (idTipoDeCredito)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS pagodecredito (
            idPagoDeCredito INT NOT NULL,
            TipoDePago VARCHAR(50) DEFAULT NULL,
            idCreditos INT NOT NULL,
            AccionRealizada VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (idPagoDeCredito),
            KEY idCreditos (idCreditos),
            CONSTRAINT pagodecredito_ibfk_1 FOREIGN KEY (idCreditos) REFERENCES creditos (idCreditos)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS cuentas (
            idCuentas INT NOT NULL,
            Banco TEXT,
            Monto DECIMAL(10,0) DEFAULT NULL,
            idPresupuesto INT NOT NULL,
            PRIMARY KEY (idCuentas),
            KEY idPresupuesto (idPresupuesto),
            CONSTRAINT cuentas_ibfk_1 FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    console.log('✅ Tablas creadas/verificadas en MySQL');
}

async function insertBasicDataSQLite(db) {
    // Insertar datos básicos en tipopresupuesto
    await runSQLite(db, `
        INSERT OR IGNORE INTO tipopresupuesto (idTipoPresupuesto, TipoDePresupuesto) VALUES
        (1, 'Anual'),
        (2, 'Mensual'),
        (3, 'Quincenal'),
        (4, 'Semanal'),
        (5, 'Diario'),
        (6, 'Proyecto'),
        (7, 'Emergencia')
    `);

    // Insertar datos básicos en tipodecredito
    await runSQLite(db, `
        INSERT OR IGNORE INTO tipodecredito (idTipoDeCredito, TipoDeCredito) VALUES
        (1, 'Hipotecario'),
        (2, 'Automotriz'),
        (3, 'Personal'),
        (4, 'Educativo'),
        (5, 'Comercial'),
        (6, 'Agrícola'),
        (7, 'Turístico')
    `);

    // Usuario de prueba (contraseña hasheada de 'password123')
    await runSQLite(db, `
        INSERT OR IGNORE INTO usuario (NombreUsuario, Nombres, Apellidos, Contraseña, Correo, Profesion, rol)
        VALUES ('testuser', 'Test', 'User', '$2b$10$hashedpassword', 'test@test.com', 'Tester', 'userN')
    `);

    console.log('✅ Datos básicos insertados en SQLite');
}

async function insertBasicDataMySQL(connection) {
    await connection.execute(`
        INSERT IGNORE INTO tipopresupuesto (idTipoPresupuesto, TipoDePresupuesto) VALUES
        (1, 'Anual'),
        (2, 'Mensual'),
        (3, 'Quincenal'),
        (4, 'Semanal'),
        (5, 'Diario'),
        (6, 'Proyecto'),
        (7, 'Emergencia')
    `);

    await connection.execute(`
        INSERT IGNORE INTO tipodecredito (idTipoDeCredito, TipoDeCredito) VALUES
        (1, 'Hipotecario'),
        (2, 'Automotriz'),
        (3, 'Personal'),
        (4, 'Educativo'),
        (5, 'Comercial'),
        (6, 'Agrícola'),
        (7, 'Turístico')
    `);

    await connection.execute(`
        INSERT IGNORE INTO usuario (NombreUsuario, Nombres, Apellidos, Contraseña, Correo, Profesion, rol)
        VALUES ('testuser', 'Test', 'User', '$2b$10$hashedpassword', 'test@test.com', 'Tester', 'userN')
    `);

    console.log('✅ Datos básicos insertados en MySQL');
}

// Ejecutar automáticamente
setupDatabase();

module.exports = setupDatabase;