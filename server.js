require('dotenv').config();

const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Verify the database connection is ready before accepting traffic
        await db.query('SELECT 1');
        console.log('✅ Conexión a la base de datos verificada');
    } catch (error) {
        console.error('❌ No se pudo verificar la conexión a la base de datos:', error.message || error);
        // Allow the server to start even if the DB check fails (db module handles fallback)
    }

    app.listen(PORT, () => {
        console.log(`🚀 BossBudget API running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Cargado correctamente' : '❌ No definido'}`);
        console.log(`🗄️  DB_TYPE: ${process.env.MYSQL_HOST ? 'MySQL' : 'SQLite (fallback)'}`);
    });
}

startServer();