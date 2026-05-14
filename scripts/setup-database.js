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
const SQLITE_FILE_PATH = path.resolve(process.env.SQLITE_FILE || path.join(__dirname, '../database.sqlite'));

function ensureSqliteFile() {
  const dir = path.dirname(SQLITE_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(SQLITE_FILE_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
      if (error) return reject(error);
      db.run('PRAGMA foreign_keys = ON;', (pragmaError) => {
        db.close((closeError) => {
          if (error) return reject(error);
          if (pragmaError) return reject(pragmaError);
          if (closeError) return reject(closeError);
          resolve();
        });
      });
    });
  });
}

async function setupSqlite() {
  console.log('🔌 Configurando SQLite local...');
  await ensureSqliteFile();
  console.log(`✅ Archivo SQLite listo en: ${SQLITE_FILE_PATH}`);
}

async function setupMysql() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'bossbudget';
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  console.log('🔌 Configurando MySQL...');
  console.log(`   Host: ${host}`);
  console.log(`   Database: ${database}`);

  const connection = await mysql.createConnection({ host, user, password, port, multipleStatements: true });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS `' + database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.query('USE `' + database + '`;');
    await connection.query('SELECT 1');
    console.log('✅ Conexión MySQL verificada');
  } finally {
    await connection.end();
  }
}

async function setupDatabase() {
  console.log('🛠️  setup-database ejecutando con DB_TYPE=' + DB_TYPE);

  if (DB_TYPE === 'sqlite') {
    await setupSqlite();
    return;
  }

  try {
    await setupMysql();
  } catch (error) {
    console.error('⚠️ No se pudo conectar a MySQL:', error.message || error);
    console.log('ℹ️ Usando SQLite como fallback local');
    await setupSqlite();
  }
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error('❌ Error ejecutando setup-database:', error);
    process.exit(1);
  });
}

module.exports = setupDatabase;
