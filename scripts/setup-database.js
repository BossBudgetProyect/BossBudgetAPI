// scripts/setup-database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    let connection;
    
    // DETECTAR ENTORNO AUTOMÁTICAMENTE
    const isProduction = process.env.NODE_ENV === 'production';
    const isCodespaces = process.env.CODESPACES === 'true' || process.env.DB_HOST === 'localhost';
    
    console.log('═'.repeat(50));
    console.log(`🔍 Entorno detectado: ${isProduction ? '🏢 PRODUCCIÓN (Universidad)' : '💻 DESARROLLO (Codespaces)'}`);
    console.log('═'.repeat(50));
    
    try {
        
        // ========== MODO PRODUCCIÓN ==========
        if (isProduction) {
            console.log('📡 Conectando a base de datos de la UNIVERSIDAD...');
            console.log(`   Host: ${process.env.DB_HOST}`);
            console.log(`   Base: ${process.env.DB_NAME}`);
            
            // Solo verificar conexión, NO crear nada
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 3306
            });
            
            console.log('✅ CONEXIÓN EXITOSA a base de datos de la universidad');
            
            // Verificar si hay tablas
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
            
            console.log('\n✨ API lista para usar con la BD de la universidad');
        }
        
        // ========== MODO DESARROLLO ==========
        else {
            console.log('🔧 Configurando base de datos LOCAL en Codespaces...');
            
            // 1. Conectar sin base de datos
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password'
            });
            
            console.log('✅ Conectado a MySQL local');
            
            // 2. Crear base de datos si no existe
            const dbName = process.env.DB_NAME || 'bossbudget';
            await connection.execute(
                `CREATE DATABASE IF NOT EXISTS ${dbName} 
                 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
            );
            console.log(`✅ Base de datos '${dbName}' creada/verificada`);
            
            await connection.end();
            
            // 3. Conectar a la base de datos específica
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || 'password',
                database: dbName,
                multipleStatements: true
            });
            
            console.log('📋 Creando tablas...');
            
            // ========== TUS TABLAS (copiar de tu código original) ==========
            await createAllTables(connection);
            
            console.log('📊 Insertando datos básicos...');
            await insertBasicData(connection);
            
            console.log('\n🎉 Base de datos LOCAL configurada exitosamente!');
            console.log('📋 Tablas creadas: usuario, presupuesto, gastos, ingresos, etc.');
            console.log('👤 Usuario de prueba: testuser / contraseña: (hasheada)');
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        
        if (isProduction) {
            console.error('\n🔧 SOLUCIÓN para producción:');
            console.error('1. Verifica las credenciales de la universidad en .env');
            console.error('2. Asegúrate que la base de datos exista');
            console.error('3. Verifica que tu IP esté permitida');
        } else {
            console.error('\n🔧 SOLUCIÓN para Codespaces:');
            console.error('1. Ejecuta: sudo service mysql start');
            console.error('2. Verifica que MySQL esté instalado');
        }
        
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

// ========== FUNCIONES DE CREACIÓN DE TABLAS ==========
async function createAllTables(connection) {
    // TABLA usuario
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
    
    // TABLA password_reset_tokens
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

    // TABLA tipopresupuesto
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS tipopresupuesto (
            idTipoPresupuesto INT NOT NULL,
            TipoDePresupuesto VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (idTipoPresupuesto)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // TABLA presupuesto
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

    // TABLA detallepresupuesto
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

    // TABLA gastos
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

    // TABLA ingresos
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

    // TABLA telefonos
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

    // TABLA recordatorios
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

    // TABLA tiposderecordatorios
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

    // TABLA tipodecredito
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS tipodecredito (
            idTipoDeCredito INT NOT NULL,
            TipoDeCredito VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY (idTipoDeCredito)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // TABLA creditos
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

    // TABLA pagodecredito
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

    // TABLA cuentas
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
    
    console.log('✅ Tablas creadas/verificadas');
}

async function insertBasicData(connection) {
    // Insertar datos básicos en tipopresupuesto
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

    // Insertar datos básicos en tipodecredito
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

    // Usuario de prueba
    await connection.execute(`
        INSERT IGNORE INTO usuario (NombreUsuario, Nombres, Apellidos, Contraseña, Correo, Profesion, rol) 
        VALUES ('testuser', 'Test', 'User', '$2b$10$hashedpassword', 'test@test.com', 'Tester', 'userN')
    `);
    
    console.log('✅ Datos básicos insertados');
}

// Ejecutar automáticamente
setupDatabase();

module.exports = setupDatabase;