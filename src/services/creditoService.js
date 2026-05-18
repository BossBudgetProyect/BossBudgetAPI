// services/creditoService.js
const creditoRepository = require('../repositories/creditoRepository');
const pagoCreditoRepository = require('../repositories/pagoCreditoRepository');
const db = require('../config/database');
const Credito = require('../models/creditoModel');
const PagoCredito = require('../models/pagoCreditoModel');

// Crear instancias de repositorios con la base de datos
const repository = new creditoRepository(db, true);
const pagoRepository = new pagoCreditoRepository(db, true);

class CreditoService {
    constructor(creditoRepository, pagoCreditoRepository) {
        this.creditoRepository = creditoRepository;
        this.pagoCreditoRepository = pagoCreditoRepository;
    }

    // ✅ NUEVO: Verificar que el presupuesto pertenece al usuario
    async verificarPresupuestoUsuario(idPresupuesto, nombreUsuario) {
        const [presupuesto] = await db.execute(
            'SELECT * FROM presupuesto WHERE idPresupuesto = ? AND NombreUsuario = ?',
            [idPresupuesto, nombreUsuario]
        );
        
        if (presupuesto.length === 0) {
            throw new Error('Presupuesto no encontrado o no pertenece al usuario');
        }
        
        return presupuesto[0];
    }

    async createCredito(creditoData, nombreUsuario) { // ← Agregar nombreUsuario como parámetro
        // Verificar que el presupuesto pertenece al usuario
        await this.verificarPresupuestoUsuario(creditoData.idPresupuesto, nombreUsuario);
        
        const credito = new Credito(creditoData);
        credito.validate();
        
        const id = await this.creditoRepository.create(credito.toDatabase());
        return this.creditoRepository.findById(id);
    }

    async getCreditoById(id, nombreUsuario) {
        const credito = await this.creditoRepository.findById(id);
        if (!credito) throw new Error('Crédito no encontrado');
        
        // Verificar que el crédito pertenece al usuario a través del presupuesto
        await this.verificarPresupuestoUsuario(credito.idPresupuesto, nombreUsuario);
        
        const pagos = await this.pagoCreditoRepository.findByCredito(id);
        credito.pagos = pagos;
        credito.montoPagado = pagos.reduce((sum, pago) => sum + (parseFloat(pago.Monto) || 0), 0);
        credito.saldoPendiente = parseFloat(credito.MontoTotal) - credito.montoPagado;
        
        return credito;
    }

    async getCreditosByPresupuesto(idPresupuesto, nombreUsuario) {
        // Verificar que el presupuesto pertenece al usuario
        await this.verificarPresupuestoUsuario(idPresupuesto, nombreUsuario);
        
        const creditos = await this.creditoRepository.findByPresupuesto(idPresupuesto);
        
        for (const credito of creditos) {
            const pagos = await this.pagoCreditoRepository.findByCredito(credito.idCreditos);
            credito.pagos = pagos;
            credito.montoPagado = pagos.reduce((sum, pago) => sum + (parseFloat(pago.Monto) || 0), 0);
            credito.saldoPendiente = parseFloat(credito.MontoTotal) - credito.montoPagado;
        }
        
        return creditos;
    }

    async getCreditosByUsuario(nombreUsuario) {
        const creditos = await this.creditoRepository.findByUsuario(nombreUsuario);
        
        for (const credito of creditos) {
            const pagos = await this.pagoCreditoRepository.findByCredito(credito.idCreditos);
            credito.pagos = pagos;
            credito.montoPagado = pagos.reduce((sum, pago) => sum + (parseFloat(pago.Monto) || 0), 0);
            credito.saldoPendiente = parseFloat(credito.MontoTotal) - credito.montoPagado;
        }
        
        return creditos;
    }

    async updateCredito(id, creditoData, nombreUsuario) {
        // Obtener el crédito existente y verificar propiedad
        const creditoExistente = await this.creditoRepository.findById(id);
        if (!creditoExistente) throw new Error('Crédito no encontrado');
        
        await this.verificarPresupuestoUsuario(creditoExistente.idPresupuesto, nombreUsuario);
        
        const creditoActualizado = new Credito({ ...creditoExistente, ...creditoData });
        creditoActualizado.validate();
        
        return this.creditoRepository.update(id, creditoActualizado.toDatabase());
    }

    async deleteCredito(id, nombreUsuario) {
        // Obtener el crédito existente y verificar propiedad
        const credito = await this.creditoRepository.findById(id);
        if (!credito) throw new Error('Crédito no encontrado');
        
        await this.verificarPresupuestoUsuario(credito.idPresupuesto, nombreUsuario);
        
        const pagos = await this.pagoCreditoRepository.findByCredito(id);
        if (pagos.length > 0) {
            throw new Error('No se puede eliminar el crédito porque tiene pagos registrados');
        }
        
        return this.creditoRepository.delete(id);
    }

    async registrarPago(pagoData, nombreUsuario) {
        // Verificar que el crédito pertenece al usuario
        const credito = await this.creditoRepository.findById(pagoData.idCreditos);
        if (!credito) throw new Error('Crédito no encontrado');
        
        await this.verificarPresupuestoUsuario(credito.idPresupuesto, nombreUsuario);
        
        const pago = new PagoCredito(pagoData);
        pago.validate();
        
        pago.AccionRealizada = pago.AccionRealizada || 'Pago registrado';
        
        const id = await this.pagoCreditoRepository.create(pago.toDatabase());
        
        const pagosActuales = await this.pagoCreditoRepository.findByCredito(credito.idCreditos);
        const totalPagado = pagosActuales.reduce((sum, p) => sum + (parseFloat(p.Monto) || 0), 0);
        
        if (totalPagado >= parseFloat(credito.MontoTotal)) {
            console.log(`Crédito ${credito.idCreditos} completamente pagado`);
        }
        
        return { id, pago: pago.toDatabase() };
    }

    async getResumenUsuario(nombreUsuario) {
        return this.creditoRepository.getResumenByUsuario(nombreUsuario);
    }
}

const creditoService = new CreditoService(repository, pagoRepository);
module.exports = creditoService;