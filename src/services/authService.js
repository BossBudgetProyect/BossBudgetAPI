// services/AuthService.js
const usuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    
    // Login de usuario (existente)
    async login(correo, contraseña) {
        if (!correo || !contraseña) {
            throw new Error('Por favor, ingresa correo y contraseña.');
        }

        const usuario = await usuarioRepository.findByEmail(correo);
        if (!usuario) {
            throw new Error('Correo y/o contraseña incorrectos');
        }

        const contraseñaValida = await bcrypt.compare(contraseña, usuario.Contraseña);
        if (!contraseñaValida) {
            throw new Error('Correo y/o contraseña incorrectos');
        }

        const token = jwt.sign(
            { 
                correo: usuario.Correo,
                nombreUsuario: usuario.NombreUsuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return {
            usuario: usuario.toJSON(),
            token
        };
    }

    // Registro de usuario (existente)
    async registrar(datosUsuario, imagenNombre = null) {
        const { username, nombres, apellidos, password, email, profesion, nacimiento, expectativas } = datosUsuario;

        if (!username || !nombres || !apellidos || !password || !email) {
            throw new Error('Todos los campos obligatorios deben ser llenados');
        }

        const usuarioExistente = await usuarioRepository.findByEmail(email);
        if (usuarioExistente) {
            throw new Error('El correo electrónico ya está registrado');
        }

        const usernameExistente = await usuarioRepository.findByUsername(username);
        if (usernameExistente) {
            throw new Error('El nombre de usuario ya está en uso');
        }

        const contraseñaHasheada = await bcrypt.hash(password, 10);

        const usuario = await usuarioRepository.create({
            NombreUsuario: username,
            Nombres: nombres,
            Apellidos: apellidos,
            Contraseña: contraseñaHasheada,
            Correo: email,
            Profesion: profesion || null,
            FechaDeNacimiento: nacimiento || null,
            Expectativas: expectativas || null,
            Foto: imagenNombre,
            rol: 'userN'
        });

        const token = jwt.sign(
            { 
                correo: usuario.Correo,
                nombreUsuario: usuario.NombreUsuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            usuario: usuario.toJSON(),
            token
        };
    }

    // Obtener perfil de usuario (existente)
    async obtenerPerfil(correo) {
        const usuario = await usuarioRepository.findByEmail(correo);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario.toJSON();
    }

    // NUEVO: Actualizar perfil de usuario
    async actualizarPerfil(correo, datosActualizados) {
        if (!correo) {
            throw new Error('Correo es requerido');
        }

        // Verificar que el usuario existe
        const usuarioExistente = await usuarioRepository.findByEmail(correo);
        if (!usuarioExistente) {
            throw new Error('Usuario no encontrado');
        }

        // Actualizar el perfil
        const usuarioActualizado = await usuarioRepository.updateProfile(correo, {
            Nombres: datosActualizados.nombres,
            Apellidos: datosActualizados.apellidos,
            Profesion: datosActualizados.profesion,
            Expectativas: datosActualizados.expectativas
        });

        return usuarioActualizado.toJSON();
    }

    // NUEVO: Cambiar contraseña
    async cambiarContraseña(correo, contraseñaActual, nuevaContraseña) {
        const usuario = await usuarioRepository.findByEmail(correo);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.Contraseña);
        if (!contraseñaValida) {
            throw new Error('Contraseña actual incorrecta');
        }

        const nuevaContraseñaHasheada = await bcrypt.hash(nuevaContraseña, 10);
        await usuarioRepository.updatePassword(correo, nuevaContraseñaHasheada);

        return { message: 'Contraseña actualizada correctamente' };
    }
}

module.exports = new AuthService();