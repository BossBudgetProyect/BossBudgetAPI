const tipoCreditoRepository = require('../repositories/tipoCreditoRepository');
const TipoCredito = require('../models/tipoCreditoModel');

class TipoCreditoService {
    constructor(tipoCreditoRepository) {
        this.tipoCreditoRepository = tipoCreditoRepository;
    }

    async getAllTipos() {
        return this.tipoCreditoRepository.findAll();
    }

    async getTipoById(id) {
        const tipo = await this.tipoCreditoRepository.findById(id);
        if (!tipo) throw new Error('Tipo de crédito no encontrado');
        return tipo;
    }

    async createTipo(tipoData) {
        const tipo = new TipoCredito(tipoData);
        tipo.validate();
        
        // Si no se proporciona ID, generar uno nuevo
        if (!tipo.idTipoDeCredito) {
            const tipos = await this.tipoCreditoRepository.findAll();
            const maxId = tipos.reduce((max, t) => Math.max(max, t.idTipoDeCredito), 0);
            tipo.idTipoDeCredito = maxId + 1;
        }
        
        await this.tipoCreditoRepository.create(tipo.toDatabase());
        return this.tipoCreditoRepository.findById(tipo.idTipoDeCredito);
    }

    async updateTipo(id, tipoData) {
        const tipoExistente = await this.tipoCreditoRepository.findById(id);
        if (!tipoExistente) throw new Error('Tipo de crédito no encontrado');
        
        const tipo = new TipoCredito({ ...tipoExistente, ...tipoData });
        tipo.validate();
        
        return this.tipoCreditoRepository.update(id, tipo.toDatabase());
    }

    async deleteTipo(id) {
        const tipo = await this.tipoCreditoRepository.findById(id);
        if (!tipo) throw new Error('Tipo de crédito no encontrado');
        
        return this.tipoCreditoRepository.delete(id);
    }
}

module.exports = new TipoCreditoService(tipoCreditoRepository);