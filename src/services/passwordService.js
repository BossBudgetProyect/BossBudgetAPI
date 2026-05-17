const usuarioRepository = require('../repositories/usuarioRepository');
const passwordResetTokenRepository = require('../repositories/passwordResetTokenRepository');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('./emailService'); // ← CAMBIO: ya no usa nodemailer

class PasswordService {
    
    async solicitarRecuperacion(correo) {
        const usuario = await usuarioRepository.findByEmail(correo);
        if (!usuario) {
            throw new Error('No hay cuenta asociada a este correo');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        await passwordResetTokenRepository.create(usuario.Correo, token, expiresAt);

        // Enlace directo al frontend con el token
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        
        // ✅ CAMBIO: usar Resend en lugar de Nodemailer
        await emailService.sendPasswordResetEmail(correo, resetLink);

        return { 
            message: '¡Revisa tu correo para el enlace de recuperación!'
        };
    }   

    async restablecerContraseña(token, nuevaContraseña) {
        if (!nuevaContraseña || nuevaContraseña.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Verificar token válido
        const tokenData = await passwordResetTokenRepository.findValidToken(token);
        if (!tokenData) {
            throw new Error('El token es inválido o ha expirado');
        }

        // Hashear nueva contraseña
        const contraseñaHasheada = await bcrypt.hash(nuevaContraseña, 10);

        // Actualizar por CORREO en lugar de NombreUsuario
        const actualizado = await usuarioRepository.updatePassword(
            tokenData.correo,
            contraseñaHasheada
        );

        if (!actualizado) {
            throw new Error('Error al actualizar la contraseña');
        }

        // Eliminar token usado
        await passwordResetTokenRepository.delete(token);

        return { message: 'Contraseña actualizada correctamente' };
    }

    async verificarToken(token) {
        const tokenData = await passwordResetTokenRepository.findValidToken(token);
        return {
            valido: !!tokenData,
            correo: tokenData?.correo
        };
    }
}

module.exports = new PasswordService();