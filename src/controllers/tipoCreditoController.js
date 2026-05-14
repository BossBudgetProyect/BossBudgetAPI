class TipoCreditoController {
    constructor(tipoCreditoService) {
        this.tipoCreditoService = tipoCreditoService;
    }

    async getAllTipos(req, res) {
        try {
            const tipos = await this.tipoCreditoService.getAllTipos();
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

    async getTipoById(req, res) {
        try {
            const tipo = await this.tipoCreditoService.getTipoById(req.params.id);
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

    async createTipo(req, res) {
        try {
            const tipo = await this.tipoCreditoService.createTipo(req.body);
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

    async updateTipo(req, res) {
        try {
            const tipo = await this.tipoCreditoService.updateTipo(req.params.id, req.body);
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

    async deleteTipo(req, res) {
        try {
            await this.tipoCreditoService.deleteTipo(req.params.id);
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

module.exports = TipoCreditoController;