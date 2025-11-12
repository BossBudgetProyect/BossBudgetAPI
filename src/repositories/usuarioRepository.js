// repositories/usuarioRepository.js
const db = require('../config/database');
const Usuario = require('../models/Usuario');

class UsuarioRepository {
    
    async create(usuarioData) {
        const [result] = await db.execute(
            `INSERT INTO usuario (Correo, Nombres, Apellidos, Contraseña, Profesion, FechaDeNacimiento, Expectativas, NombreUsuario, Foto, rol) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioData.Correo,
                usuarioData.Nombres,
                usuarioData.Apellidos,
                usuarioData.Contraseña,
                usuarioData.Profesion,
                usuarioData.FechaDeNacimiento,
                usuarioData.Expectativas,
                usuarioData.NombreUsuario,
                usuarioData.Foto,
                usuarioData.rol || 'userN'
            ]
        );
        
        return new Usuario(
            usuarioData.Correo,
            usuarioData.Nombres,
            usuarioData.Apellidos,
            usuarioData.Contraseña,
            usuarioData.Profesion,
            usuarioData.FechaDeNacimiento,
            usuarioData.Expectativas,
            usuarioData.NombreUsuario,
            usuarioData.Foto,
            usuarioData.rol || 'userN'
        );
    }

    async findByEmail(correo) {
        const [rows] = await db.execute(
            'SELECT * FROM usuario WHERE Correo = ?',
            [correo]
        );
        
        if (rows.length === 0) return null;
        
        const usuario = rows[0];
        return new Usuario(
            usuario.Correo,
            usuario.Nombres,
            usuario.Apellidos,
            usuario.Contraseña,
            usuario.Profesion,
            usuario.FechaDeNacimiento,
            usuario.Expectativas,
            usuario.NombreUsuario,
            usuario.Foto,
            usuario.rol
        );
    }

    async findByUsername(nombreUsuario) {
        const [rows] = await db.execute(
            'SELECT * FROM usuario WHERE NombreUsuario = ?',
            [nombreUsuario]
        );
        
        if (rows.length === 0) return null;
        
        const usuario = rows[0];
        return new Usuario(
            usuario.Correo,
            usuario.Nombres,
            usuario.Apellidos,
            usuario.Contraseña,
            usuario.Profesion,
            usuario.FechaDeNacimiento,
            usuario.Expectativas,
            usuario.NombreUsuario,
            usuario.Foto,
            usuario.rol
        );
    }

    async updatePassword(correo, nuevaContraseña) {
        const [result] = await db.execute(
            'UPDATE usuario SET Contraseña = ? WHERE Correo = ?',
            [nuevaContraseña, correo]
        );
        
        return result.affectedRows > 0;
    }

    // NUEVO: Actualizar perfil del usuario (sin contraseña)
    async updateProfile(correo, datosActualizados) {
        const { 
            Nombres, 
            Apellidos, 
            Profesion,  
            Expectativas 
        } = datosActualizados;

        const [result] = await db.execute(
            `UPDATE usuario 
             SET Nombres = ?, Apellidos = ?, Profesion = ?, Expectativas = ?
             WHERE Correo = ?`,
            [
                Nombres,
                Apellidos,
                Profesion,
                Expectativas,
                correo
            ]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Usuario no encontrado');
        }

        // Devolver el usuario actualizado
        return this.findByEmail(correo);
    }

    // NUEVO: Obtener todos los usuarios (si lo necesitas)
    async findAll() {
        const [rows] = await db.execute('SELECT * FROM usuario');
        
        return rows.map(usuario => new Usuario(
            usuario.Correo,
            usuario.Nombres,
            usuario.Apellidos,
            usuario.Contraseña,
            usuario.Profesion,
            usuario.FechaDeNacimiento,
            usuario.Expectativas,
            usuario.NombreUsuario,
            usuario.Foto,
            usuario.rol
        ));
    }
}

module.exports = new UsuarioRepository();