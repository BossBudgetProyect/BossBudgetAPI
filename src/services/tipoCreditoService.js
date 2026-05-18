// services/tipoCreditoService.js
const db = require('../config/database'); // ← Importar la base de datos
const TipoCreditoRepository = require('../repositories/tipoCreditoRepository');
const TipoCredito = require('../models/tipoCreditoModel');

// ✅ Crear instancia del repositorio pasando la base de datos
const tipoCreditoRepository = new TipoCreditoRepository(db, true);

class TipoCreditoService {
    async getAllTipos() {
        return await tipoCreditoRepository.findAll();
    }

    async getTipoById(id) {
        const tipo = await tipoCreditoRepository.findById(id);
        if (!tipo) throw new Error('Tipo de crédito no encontrado');
        return tipo;
    }

    async createTipo(tipoData) {
        // Validar que no exista un tipo con el mismo ID
        const existente = await tipoCreditoRepository.findById(tipoData.idTipoDeCredito);
        if (existente) {
            throw new Error(`Ya existe un tipo de crédito con ID ${tipoData.idTipoDeCredito}`);
        }
        
        const tipo = new TipoCredito(tipoData.idTipoDeCredito, tipoData.TipoDeCredito);
        
        if (!tipo.idTipoDeCredito || !tipo.TipoDeCredito) {
            throw new Error('idTipoDeCredito y TipoDeCredito son requeridos');
        }
        
        await tipoCreditoRepository.create({
            idTipoDeCredito: tipo.idTipoDeCredito,
            TipoDeCredito: tipo.TipoDeCredito
        });
        
        return tipo.toJSON();
    }

    async updateTipo(id, tipoData) {
        const tipoExistente = await tipoCreditoRepository.findById(id);
        if (!tipoExistente) throw new Error('Tipo de crédito no encontrado');
        
        const tipo = new TipoCredito(id, tipoData.TipoDeCredito || tipoExistente.TipoDeCredito);
        
        await tipoCreditoRepository.update(id, {
            TipoDeCredito: tipo.TipoDeCredito
        });
        
        return tipo.toJSON();
    }

    async deleteTipo(id) {
        const tipo = await tipoCreditoRepository.findById(id);
        if (!tipo) throw new Error('Tipo de crédito no encontrado');
        
        return await tipoCreditoRepository.delete(id);
    }
}

module.exports = new TipoCreditoService();