// controllers/authController.js
const authService = require('../services/authService');
const { revokeToken } = require('../middlewares/auth');

class AuthController {
    
    // Login (existente)
    async login(req, res) {
        try {
            const { email, pass } = req.body;
            const resultado = await authService.login(email, pass);
            
            console.log('🍪 Enviando cookie authToken...');

            // Configuración de cookie
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            };

            // Establecer cookie
            res.cookie('authToken', resultado.token, cookieOptions);
            
            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    usuario: resultado.usuario
                }
            });

            console.log('✅ Cookie enviada correctamente');
        } catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }

    // Registro (existente)
    async registrar(req, res) {
        try {
            const datosUsuario = {
                username: req.body.username,
                nombres: req.body.nom,
                apellidos: req.body.apell,
                password: req.body.pass,
                email: req.body.email,
                profesion: req.body.prof,
                nacimiento: req.body.nacimiento,
                expectativas: req.body.expec
            };

            const imagenNombre = req.file ? req.file.filename : null;
            
            const resultado = await authService.registrar(datosUsuario, imagenNombre);
            
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Obtener perfil (existente)
    async obtenerPerfil(req, res) {
        try {
            const usuario = await authService.obtenerPerfil(req.user.correo);
            
            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    // NUEVO: Actualizar perfil de usuario
    async actualizarPerfil(req, res) {
        try {
            const { nombres, apellidos, profesion, expectativas } = req.body;
            
            const usuarioActualizado = await authService.actualizarPerfil(req.user.correo, {
                nombres,
                apellidos,
                profesion,
                expectativas
            });

            res.json({
                success: true,
                message: 'Perfil actualizado correctamente',
                data: usuarioActualizado
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // NUEVO: Cambiar contraseña
    async cambiarContraseña(req, res) {
        try {
            const { contraseñaActual, nuevaContraseña } = req.body;
            
            const resultado = await authService.cambiarContraseña(
                req.user.correo, 
                contraseñaActual, 
                nuevaContraseña
            );

            res.json({
                success: true,
                message: 'Contraseña actualizada correctamente',
                data: resultado
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Logout (existente)
    async logout(req, res) {
        try {
            console.log('🔐 Iniciando logout...');
            
            const token = req.cookies.authToken || (req.headers.authorization?.split(' ')[1]);
            
            if (token) {
                console.log('🗑️ Revocando token...');
                await revokeToken(token);
            }

            // ✅ LIMPIAR TODAS LAS POSIBLES COOKIES
            const clearOptions = [
                { httpOnly: true, secure: true, sameSite: 'none', domain: '.app.github.dev', path: '/' },
                { httpOnly: true, secure: true, sameSite: 'none', path: '/' },
                { httpOnly: true, secure: false, sameSite: 'lax', path: '/' },
                { path: '/' } // Opción mínima
            ];

            clearOptions.forEach(options => {
                res.clearCookie('authToken', options);
            });

            console.log('✅ Logout completado - cookies limpiadas');

            return res.status(200).json({
                success: true,
                message: 'Sesión cerrada correctamente'
            });

        } catch (error) {
            console.error('❌ Error en logout:', error);
            
            // Limpiar agresivamente incluso con error
            res.clearCookie('authToken', { path: '/' });
            res.clearCookie('authToken', { path: '/', domain: '.app.github.dev' });
            
            return res.status(200).json({
                success: true,
                message: 'Sesión cerrada'
            });
        }
    }
}

module.exports = new AuthController();