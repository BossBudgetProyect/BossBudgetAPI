// controllers/tipoCreditoController.js
const tipoCreditoService = require('../services/tipoCreditoService');

class TipoCreditoController {
    // ❌ Elimina el constructor
    // constructor(tipoCreditoService) { ... }

    async obtenerTodosTipos(req, res) {
        try {
            const tipos = await tipoCreditoService.getAllTipos();
            res.json({
                success: true,
                data: tipos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async obtenerTipoPorId(req, res) {
        try {
            const tipo = await tipoCreditoService.getTipoById(req.params.id);
            res.json({
                success: true,
                data: tipo
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async crearTipo(req, res) {
        try {
            // Verificar si es admin (opcional)
            if (req.user && req.user.rol !== 'admi') {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado. Solo administradores pueden crear tipos de crédito'
                });
            }
            
            const tipo = await tipoCreditoService.createTipo(req.body);
            res.status(201).json({
                success: true,
                message: 'Tipo de crédito creado exitosamente',
                data: tipo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async actualizarTipo(req, res) {
        try {
            if (req.user && req.user.rol !== 'admi') {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado. Solo administradores pueden actualizar tipos de crédito'
                });
            }
            
            const tipo = await tipoCreditoService.updateTipo(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Tipo de crédito actualizado exitosamente',
                data: tipo
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async eliminarTipo(req, res) {
        try {
            if (req.user && req.user.rol !== 'admi') {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado. Solo administradores pueden eliminar tipos de crédito'
                });
            }
            
            await tipoCreditoService.deleteTipo(req.params.id);
            res.json({
                success: true,
                message: 'Tipo de crédito eliminado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

// ✅ Exportar sin pasar parámetro
module.exports = new TipoCreditoController();