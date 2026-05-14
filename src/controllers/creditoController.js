class CreditoController {
    constructor(creditoService) {
        this.creditoService = creditoService;
    }

    async createCredito(req, res) {
        try {
            const credito = await this.creditoService.createCredito(req.body);
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

    async getCreditoById(req, res) {
        try {
            const credito = await this.creditoService.getCreditoById(req.params.id);
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

    async getCreditosByPresupuesto(req, res) {
        try {
            const creditos = await this.creditoService.getCreditosByPresupuesto(req.params.idPresupuesto);
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

    async getCreditosByUsuario(req, res) {
        try {
            const creditos = await this.creditoService.getCreditosByUsuario(req.params.nombreUsuario);
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

    async updateCredito(req, res) {
        try {
            const credito = await this.creditoService.updateCredito(req.params.id, req.body);
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

    async deleteCredito(req, res) {
        try {
            await this.creditoService.deleteCredito(req.params.id);
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
            const resultado = await this.creditoService.registrarPago(req.body);
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

    async getResumenUsuario(req, res) {
        try {
            const resumen = await this.creditoService.getResumenUsuario(req.params.nombreUsuario);
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
}

module.exports = CreditoController;