const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determinar el tipo de base de datos
const dbType = process.env.DB_TYPE || 'sqlite'; // 'mysql' o 'sqlite'

// Configuración para SQLite
if (dbType === 'sqlite') {
    const dbPath = path.join(__dirname, '../../database.sqlite');
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error conectando a SQLite:', err.message);
            process.exit(1);
        }
        console.log('✅ Conectado a la base de datos SQLite - BossBudget');
    });

    // Convertir callbacks a promesas para consistencia
    const promiseDb = {
        get: (sql, params) => new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }),
        all: (sql, params) => new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }),
        run: (sql, params) => new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        }),
        close: () => new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        })
    };

    module.exports = promiseDb;
} else {
    // Configuración original para MySQL
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'bossbudget',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    });

    // Convertir a Promise-based
    const promisePool = pool.promise();

    // Probar la conexión
    promisePool.getConnection()
        .then(connection => {
            console.log('✅ Conectado a la base de datos MySQL - BossBudget');
            connection.release();
        })
        .catch(error => {
            console.error('❌ Error conectando a la base de datos:', error.message);
            console.error('💡 Verifica que:');
            console.error('   - MySQL esté corriendo');
            console.error('   - Las credenciales en .env sean correctas');
            console.error('   - La base de datos exista');
            process.exit(1);
        });

    module.exports = promisePool;
}