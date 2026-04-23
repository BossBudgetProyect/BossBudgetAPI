const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function getDbType() {
    if (process.env.DB_TYPE) {
        return process.env.DB_TYPE.toLowerCase();
    }

    if (process.env.DB_HOST || process.env.DB_USER || process.env.DB_PASSWORD || process.env.DB_NAME) {
        return 'mysql';
    }

    return 'sqlite';
}

const DB_TYPE = getDbType();
const SQLITE_FILE_PATH = path.resolve(process.env.SQLITE_FILE || '/tmp/database.sqlite');

function sqliteExecute(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        const trimmed = String(sql).trim().toUpperCase();
        const callback = (error, rows) => {
            if (error) return reject(error);
            resolve([rows, undefined]);
        };

        if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('WITH')) {
            if (params.length > 0) {
                db.all(sql, params, callback);
            } else {
                db.all(sql, callback);
            }
            return;
        }

        const runCallback = function (error) {
            if (error) return reject(error);
            resolve([{ lastID: this.lastID, changes: this.changes }, undefined]);
        };

        if (params.length > 0) {
            db.run(sql, params, runCallback);
        } else {
            db.run(sql, runCallback);
        }
    });
}

function openSqliteDatabase() {
    const dir = path.dirname(SQLITE_FILE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(SQLITE_FILE_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
            if (error) return reject(error);
            db.run('PRAGMA foreign_keys = ON;', (pragmaError) => {
                if (pragmaError) return reject(pragmaError);
                resolve(db);
            });
        });
    });
}

async function setupSqliteDatabase() {
    console.log('🔌 Iniciando SQLite local...');
    const db = await openSqliteDatabase();

    try {
        console.log('📋 Creando tablas SQLite...');

        await sqliteExecute(db, `
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
                rol TEXT NOT NULL DEFAULT 'userN' CHECK (rol IN ('admi', 'userN'))
            )
        `);

        await sqliteExecute(db, `DROP TABLE IF EXISTS password_reset_tokens;`);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                Correo TEXT NOT NULL,
                token TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (Correo) REFERENCES usuario (Correo) ON DELETE CASCADE
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS tipopresupuesto (
                idTipoPresupuesto INTEGER PRIMARY KEY,
                TipoDePresupuesto TEXT
            )
        `);

        await sqliteExecute(db, `
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

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS detallepresupuesto (
                idDetalle INTEGER PRIMARY KEY AUTOINCREMENT,
                idPresupuesto INTEGER,
                categoria TEXT,
                tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('Ingreso', 'Gasto')),
                destino TEXT NOT NULL CHECK (destino IN ('presupuestado', 'real')),
                monto REAL NOT NULL,
                fecha_inicio TEXT,
                fecha_fin TEXT,
                nombre TEXT,
                FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS gastos (
                idGastos INTEGER PRIMARY KEY AUTOINCREMENT,
                idPresupuesto INTEGER NOT NULL,
                FechaDeRegistro TEXT,
                Monto REAL,
                TipoDeMonto TEXT CHECK (TipoDeMonto IN ('Efectivo', 'Tarjeta Debito', 'Tarjeta credito', 'Cheque', 'Billeteras virtuales')),
                Descripcion TEXT,
                TipoDeMontoDetalle TEXT,
                FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS ingresos (
                idIngresos INTEGER PRIMARY KEY AUTOINCREMENT,
                idPresupuesto INTEGER NOT NULL,
                FechaDeRegistro TEXT,
                Monto REAL,
                TipoDeMonto TEXT CHECK (TipoDeMonto IN ('Efectivo', 'Tarjeta Debito', 'Tarjeta credito', 'Cheque', 'Billeteras virtuales')),
                Descripcion TEXT,
                TipoDeMontoDetalle TEXT,
                FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto) ON DELETE CASCADE
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS telefonos (
                idTelefono INTEGER PRIMARY KEY AUTOINCREMENT,
                Numero TEXT,
                Correo TEXT NOT NULL,
                FOREIGN KEY (Correo) REFERENCES usuario (Correo)
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS recordatorios (
                idRecordatorios INTEGER PRIMARY KEY AUTOINCREMENT,
                Comentario TEXT,
                NombreUsuario TEXT NOT NULL,
                FOREIGN KEY (NombreUsuario) REFERENCES usuario (NombreUsuario)
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS tiposderecordatorios (
                idTiposDeRecordatorios INTEGER PRIMARY KEY AUTOINCREMENT,
                TipoDeRecordatorio TEXT,
                idRecordatorios INTEGER NOT NULL,
                FOREIGN KEY (idRecordatorios) REFERENCES recordatorios (idRecordatorios)
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS tipodecredito (
                idTipoDeCredito INTEGER PRIMARY KEY,
                TipoDeCredito TEXT
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS creditos (
                idCreditos INTEGER PRIMARY KEY AUTOINCREMENT,
                idPresupuesto INTEGER NOT NULL,
                RangoInicial TEXT,
                RangoFinal TEXT,
                MontoTotal REAL,
                idTipoDeCredito INTEGER NOT NULL,
                FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto),
                FOREIGN KEY (idTipoDeCredito) REFERENCES tipodecredito (idTipoDeCredito)
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS pagodecredito (
                idPagoDeCredito INTEGER PRIMARY KEY AUTOINCREMENT,
                TipoDePago TEXT,
                idCreditos INTEGER NOT NULL,
                AccionRealizada TEXT,
                FOREIGN KEY (idCreditos) REFERENCES creditos (idCreditos)
            )
        `);

        await sqliteExecute(db, `
            CREATE TABLE IF NOT EXISTS cuentas (
                idCuentas INTEGER PRIMARY KEY AUTOINCREMENT,
                Banco TEXT,
                Monto REAL,
                idPresupuesto INTEGER NOT NULL,
                FOREIGN KEY (idPresupuesto) REFERENCES presupuesto (idPresupuesto)
            )
        `);

        console.log('✅ Insertando datos básicos...');

        await sqliteExecute(db, `
            INSERT OR IGNORE INTO tipopresupuesto (idTipoPresupuesto, TipoDePresupuesto) VALUES
            (1, 'Anual'),
            (2, 'Mensual'),
            (3, 'Quincenal'),
            (4, 'Semanal'),
            (5, 'Diario'),
            (6, 'Proyecto'),
            (7, 'Emergencia')
        `);

        await sqliteExecute(db, `
            INSERT OR IGNORE INTO tipodecredito (idTipoDeCredito, TipoDeCredito) VALUES
            (1, 'Hipotecario'),
            (2, 'Automotriz'),
            (3, 'Personal'),
            (4, 'Educativo'),
            (5, 'Comercial'),
            (6, 'Agrícola'),
            (7, 'Turístico')
        `);

        await sqliteExecute(db, `
            INSERT OR IGNORE INTO usuario (NombreUsuario, Nombres, Apellidos, Contraseña, Correo, Profesion, rol) VALUES
            ('testuser', 'Test', 'User', '$2b$10$hashedpassword', 'test@test.com', 'Tester', 'userN')
        `);

        console.log('✅ Todos los datos básicos insertados');
        console.log('🎉 Base de datos SQLite configurada exitosamente!');
    } finally {
        db.close();
    }
}

async function setupMysqlDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password'
        });

        console.log('🔌 Conectado a MySQL...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bossbudget'} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`);
        console.log('✅ Base de datos creada/verificada');

        await connection.end();

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'bossbudget',
            multipleStatements: true
        });

        console.log('📊 Conectado a la base de datos bossbudget');
        console.log('📋 Creando tablas MySQL...');

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

        await connection.execute(`DROP TABLE IF EXISTS password_reset_tokens;`);

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

        console.log('✅ Insertando datos básicos...');

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
            INSERT IGNORE INTO usuario (NombreUsuario, Nombres, Apellidos, Contraseña, Correo, Profesion, rol) VALUES
            ('testuser', 'Test', 'User', '$2b$10$hashedpassword', 'test@test.com', 'Tester', 'userN')
        `);

        console.log('✅ Todos los datos básicos insertados');
        console.log('🎉 Base de datos configurada exitosamente!');
    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function setupDatabase() {
    if (DB_TYPE === 'sqlite') {
        await setupSqliteDatabase();
        return;
    }

    try {
        await setupMysqlDatabase();
    } catch (error) {
        console.error('⚠️ No se pudo inicializar MySQL:', error.message || error);
        console.log('ℹ️ Iniciando fallback a SQLite...');
        await setupSqliteDatabase();
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase;
