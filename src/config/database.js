const mysql = require('mysql2');
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

function createSqliteWrapper(db) {
    return {
        async execute(sql, params = []) {
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
        },

        async query(sql, params = []) {
            return this.execute(sql, params);
        },

        close() {
            return new Promise((resolve, reject) => {
                db.close((error) => {
                    if (error) return reject(error);
                    resolve();
                });
            });
        }
    };
}

function createMysqlPool() {
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

    return pool.promise();
}

async function initDatabase() {
    if (DB_TYPE === 'sqlite') {
        const sqliteDb = await openSqliteDatabase();
        console.log('✅ Usando SQLite local como base de datos');
        return createSqliteWrapper(sqliteDb);
    }

    try {
        const mysqlDb = createMysqlPool();
        const connection = await mysqlDb.getConnection();
        connection.release();
        console.log('✅ Conectado a la base de datos MySQL - BossBudget');
        return mysqlDb;
    } catch (error) {
        console.error('⚠️ No se pudo conectar a MySQL:', error.message || error);
        console.log('ℹ️ Cambiando a SQLite local como fallback');
        const sqliteDb = await openSqliteDatabase();
        return createSqliteWrapper(sqliteDb);
    }
}

let actualDb = null;
const initPromise = initDatabase().then((dbInstance) => {
    actualDb = dbInstance;
}).catch((error) => {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
});

const db = {
    async execute(sql, params = []) {
        await initPromise;
        return actualDb.execute(sql, params);
    },

    async query(sql, params = []) {
        await initPromise;
        return actualDb.query ? actualDb.query(sql, params) : actualDb.execute(sql, params);
    },

    async close() {
        await initPromise;
        return actualDb.close ? actualDb.close() : undefined;
    }
};

module.exports = db;
