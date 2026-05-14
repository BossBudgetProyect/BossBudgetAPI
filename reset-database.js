const mysql = require('mysql2/promise');

async function resetDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password' // Cambia si tienes contraseña
    });

    try {
        // Eliminar base de datos si existe
        await connection.execute('DROP DATABASE IF EXISTS bossbudget_db');
        console.log('✅ Base de datos eliminada');
        
        // Crear base de datos nueva
        await connection.execute('CREATE DATABASE bossbudget_db');
        console.log('✅ Base de datos creada');
        
        // Usar la base de datos
        await connection.execute('USE bossbudget_db');
        
        // Aquí puedes ejecutar tus CREATE TABLE
        // await connection.execute('CREATE TABLE...');
        
        console.log('✅ Base de datos reseteada exitosamente');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

resetDatabase();