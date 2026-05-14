const Credito = require('../models/creditoModel');
const PagoCredito = require('../models/pagoCreditoModel');

class CreditoService {
    constructor(creditoRepository, pagoCreditoRepository) {
        this.creditoRepository = creditoRepository;
        this.pagoCreditoRepository = pagoCreditoRepository;
    }

    async createCredito(creditoData) {
        const credito = new Credito(creditoData);
        credito.validate();
        
        // Verificar que el presupuesto existe
        const presupuesto = await this.creditoRepository.db.execute(
            'SELECT * FROM presupuesto WHERE idPresupuesto = ?', 
            [credito.idPresupuesto]
        );
        
        if (!presupuesto[0][0]) {
            throw new Error('Presupuesto no encontrado');
        }
        
        const id = await this.creditoRepository.create(credito.toDatabase());
        return this.creditoRepository.findById(id);
    }

    async getCreditoById(id) {
        const credito = await this.creditoRepository.findById(id);
        if (!credito) throw new Error('Crédito no encontrado');
        
        // Cargar pagos relacionados
        const pagos = await this.pagoCreditoRepository.findByCredito(id);
        credito.pagos = pagos;
        credito.montoPagado = pagos.reduce((sum, pago) => sum + (pago.Monto || 0), 0);
        credito.saldoPendiente = credito.MontoTotal - credito.montoPagado;
        
        return credito;
    }

    async getCreditosByPresupuesto(idPresupuesto) {
        const creditos = await this.creditoRepository.findByPresupuesto(idPresupuesto);
        
        for (const credito of creditos) {
            const pagos = await this.pagoCreditoRepository.findByCredito(credito.idCreditos);
            credito.pagos = pagos;
            credito.montoPagado = pagos.reduce((sum, pago) => sum + (pago.Monto || 0), 0);
            credito.saldoPendiente = credito.MontoTotal - credito.montoPagado;
        }
        
        return creditos;
    }

    async getCreditosByUsuario(nombreUsuario) {
        const creditos = await this.creditoRepository.findByUsuario(nombreUsuario);
        
        for (const credito of creditos) {
            const pagos = await this.pagoCreditoRepository.findByCredito(credito.idCreditos);
            credito.pagos = pagos;
            credito.montoPagado = pagos.reduce((sum, pago) => sum + (pago.Monto || 0), 0);
            credito.saldoPendiente = credito.MontoTotal - credito.montoPagado;
        }
        
        return creditos;
    }

    async updateCredito(id, creditoData) {
        const creditoExistente = await this.creditoRepository.findById(id);
        if (!creditoExistente) throw new Error('Crédito no encontrado');
        
        const creditoActualizado = new Credito({ ...creditoExistente, ...creditoData });
        creditoActualizado.validate();
        
        return this.creditoRepository.update(id, creditoActualizado.toDatabase());
    }

    async deleteCredito(id) {
        const credito = await this.creditoRepository.findById(id);
        if (!credito) throw new Error('Crédito no encontrado');
        
        // Verificar si tiene pagos asociados
        const pagos = await this.pagoCreditoRepository.findByCredito(id);
        if (pagos.length > 0) {
            throw new Error('No se puede eliminar el crédito porque tiene pagos registrados');
        }
        
        return this.creditoRepository.delete(id);
    }

    async registrarPago(pagoData) {
        const credito = await this.creditoRepository.findById(pagoData.idCreditos);
        if (!credito) throw new Error('Crédito no encontrado');
        
        const pago = new PagoCredito(pagoData);
        pago.validate();
        
        pago.AccionRealizada = pago.AccionRealizada || 'Pago registrado';
        
        const id = await this.pagoCreditoRepository.create(pago.toDatabase());
        
        // Actualizar estado del crédito si es necesario
        const pagosActuales = await this.pagoCreditoRepository.findByCredito(credito.idCreditos);
        const totalPagado = pagosActuales.reduce((sum, p) => sum + (p.Monto || 0), 0);
        
        if (totalPagado >= credito.MontoTotal) {
            // Opcional: Marcar crédito como pagado (necesitarías agregar campo 'estado' a la tabla creditos)
            console.log(`Crédito ${credito.idCreditos} completamente pagado`);
        }
        
        return { id, pago: pago.toDatabase() };
    }

    async getResumenUsuario(nombreUsuario) {
        return this.creditoRepository.getResumenByUsuario(nombreUsuario);
    }
}

module.exports = CreditoService;