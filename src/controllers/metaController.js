// controllers/metaController.js
const metaService = require('../services/metaService');

class MetaController {
    
    async crearMeta(req, res) {
        try {
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            const metaData = req.body;
            
            const nuevaMeta = await metaService.crearMeta(metaData, NombreUsuario);
            
            res.status(201).json({
                success: true,
                message: 'Meta creada exitosamente',
                data: nuevaMeta
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async listarMetas(req, res) {
        try {
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            const metas = await metaService.listarMetas(NombreUsuario);
            
            res.status(200).json({
                success: true,
                data: metas.map(meta => meta.toJSON())
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async obtenerMeta(req, res) {
        try {
            const { id } = req.params;
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            
            const meta = await metaService.obtenerMeta(id, NombreUsuario);
            
            res.status(200).json({
                success: true,
                data: meta.toJSON()
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async actualizarMeta(req, res) {
        try {
            const { id } = req.params;
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            const metaData = req.body;
            
            await metaService.actualizarMeta(id, metaData, NombreUsuario);
            
            res.status(200).json({
                success: true,
                message: 'Meta actualizada exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async actualizarProgreso(req, res) {
        try {
            const { id } = req.params;
            const { montoActual } = req.body;
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            
            if (montoActual === undefined) {
                throw new Error('El monto actual es requerido');
            }
            
            await metaService.actualizarProgreso(id, NombreUsuario, montoActual);
            
            res.status(200).json({
                success: true,
                message: 'Progreso actualizado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async eliminarMeta(req, res) {
        try {
            const { id } = req.params;
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            
            await metaService.eliminarMeta(id, NombreUsuario);
            
            res.status(200).json({
                success: true,
                message: 'Meta eliminada exitosamente'
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
    
    async obtenerEstadisticas(req, res) {
        try {
            const NombreUsuario = req.user.nombreUsuario; // ← minúscula
            const estadisticas = await metaService.obtenerEstadisticas(NombreUsuario);
            
            res.status(200).json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new MetaController();