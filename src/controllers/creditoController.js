// controllers/creditoController.js
const creditoService = require('../services/creditoService'); // ← Importar el servicio

class CreditoController {
    async crearCredito(req, res) {
        try {
            const credito = await creditoService.createCredito(req.body);
            res.status(201).json({
                success: true,
                message: 'Crédito creado exitosamente',
                data: credito
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async obtenerCredito(req, res) {
        try {
            const credito = await creditoService.getCreditoById(req.params.id);
            res.json({
                success: true,
                data: credito
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }

    async obtenerCreditosPorPresupuesto(req, res) {
        try {
            const creditos = await creditoService.getCreditosByPresupuesto(req.params.idPresupuesto);
            res.json({
                success: true,
                data: creditos
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async misCreditos(req, res) {
        try {
            const creditos = await creditoService.getCreditosByUsuario(req.user.nombreUsuario);
            res.json({
                success: true,
                data: creditos
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async miResumenCreditos(req, res) {
        try {
            const resumen = await creditoService.getResumenUsuario(req.user.nombreUsuario);
            res.json({
                success: true,
                data: resumen
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async actualizarCredito(req, res) {
        try {
            const credito = await creditoService.updateCredito(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Crédito actualizado exitosamente',
                data: credito
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async eliminarCredito(req, res) {
        try {
            await creditoService.deleteCredito(req.params.id);
            res.json({
                success: true,
                message: 'Crédito eliminado exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async registrarPago(req, res) {
        try {
            const resultado = await creditoService.registrarPago(req.body);
            res.status(201).json({
                success: true,
                message: 'Pago registrado exitosamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new CreditoController();