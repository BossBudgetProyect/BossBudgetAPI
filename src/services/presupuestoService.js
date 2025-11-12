const presupuestoRepository = require('../repositories/presupuestoRepository');
const detallePresupuestoRepository = require('../repositories/detallePresupuestoRepository');
const ingresoRepository = require('../repositories/ingresoRepository');
const gastoRepository = require('../repositories/gastoRepository');

class PresupuestoService {
    
    // Crear presupuesto con detalle
    async crearPresupuestoConDetalle(presupuestoData, detalleData) {
        // Validaciones
        if (!detalleData.nombre || !detalleData.monto || !detalleData.fecha_inicio || !detalleData.fecha_fin || !detalleData.categoria) {
            throw new Error('Todos los campos obligatorios deben ser completados');
        }

        if (isNaN(detalleData.monto) || detalleData.monto <= 0) {
            throw new Error('El monto debe ser un número válido mayor a 0');
        }

        // Crear presupuesto
        const presupuesto = await presupuestoRepository.create(presupuestoData);
        
        // Crear detalle asociado al presupuesto
        const detalle = await detallePresupuestoRepository.create({
            ...detalleData,
            idPresupuesto: presupuesto.idPresupuesto,
            tipo_movimiento: 'Ingreso',
            destino: 'presupuestado'
        });

        return {
            presupuesto: presupuesto.toJSON(),
            detalle: detalle.toJSON()
        };
    }

    // Obtener presupuesto completo con detalles, ingresos y gastos
    async obtenerPresupuestoCompleto(idPresupuesto, nombreUsuario) {
        // Verificar que el presupuesto pertenece al usuario
        const presupuesto = await presupuestoRepository.findByIdAndUser(idPresupuesto, nombreUsuario);
        if (!presupuesto) {
            throw new Error('Presupuesto no encontrado o no tienes permiso');
        }

        // Obtener detalles, ingresos y gastos en paralelo
        const [detalles, ingresos, gastos] = await Promise.all([
            detallePresupuestoRepository.findByPresupuesto(idPresupuesto),
            ingresoRepository.findByPresupuesto(idPresupuesto),
            gastoRepository.findByPresupuesto(idPresupuesto)
        ]);

        // Calcular totales
        const totalIngresos = ingresos.reduce((sum, ingreso) => sum + parseFloat(ingreso.Monto), 0);
        const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.Monto), 0);
        const balance = totalIngresos - totalGastos;

        return {
            presupuesto: presupuesto.toJSON(),
            detalles: detalles.map(d => d.toJSON()),
            ingresos: ingresos.map(i => i.toJSON()),
            gastos: gastos.map(g => g.toJSON()),
            totales: {
                ingresos: totalIngresos,
                gastos: totalGastos,
                balance: balance
            }
        };
    }

    // Actualizar presupuesto - VERSIÓN CORREGIDA
    async actualizarPresupuesto(idPresupuesto, nombreUsuario, presupuestoData) {
        console.log('🔍 DEBUG - Datos recibidos en servicio:', presupuestoData);
        
        // 1. Primero verificar que el presupuesto existe y pertenece al usuario
        const presupuesto = await presupuestoRepository.findByIdAndUser(idPresupuesto, nombreUsuario);
        if (!presupuesto) {
            throw new Error('Presupuesto no encontrado o no tienes permiso');
        }

        // 2. Obtener el primer detalle del presupuesto (asumimos que hay uno)
        const detalles = await detallePresupuestoRepository.findByPresupuesto(idPresupuesto);
        if (detalles.length === 0) {
            throw new Error('No se encontró el detalle del presupuesto');
        }

        const detalle = detalles[0];
        
        // 3. Preparar datos para actualizar el DETALLE
        const datosActualizarDetalle = {};
        
        // Solo incluir campos que tienen valores definidos
        if (presupuestoData.nombre !== undefined && presupuestoData.nombre !== null) {
            datosActualizarDetalle.nombre = presupuestoData.nombre;
        }
        if (presupuestoData.monto !== undefined && presupuestoData.monto !== null) {
            datosActualizarDetalle.monto = parseFloat(presupuestoData.monto);
        }
        if (presupuestoData.fecha_inicio !== undefined && presupuestoData.fecha_inicio !== null) {
            datosActualizarDetalle.fecha_inicio = presupuestoData.fecha_inicio;
        }
        if (presupuestoData.fecha_fin !== undefined && presupuestoData.fecha_fin !== null) {
            datosActualizarDetalle.fecha_fin = presupuestoData.fecha_fin;
        }
        if (presupuestoData.categoria !== undefined && presupuestoData.categoria !== null) {
            datosActualizarDetalle.categoria = presupuestoData.categoria;
        }

        console.log('🔍 DEBUG - Actualizando detalle con:', datosActualizarDetalle);

        // 4. Actualizar el detalle usando el repositorio CORRECTO
        const detalleActualizado = await detallePresupuestoRepository.update(
            detalle.idDetalle, 
            datosActualizarDetalle
        );

        if (!detalleActualizado) {
            throw new Error('Error al actualizar el detalle del presupuesto');
        }

        return await this.obtenerPresupuestoCompleto(idPresupuesto, nombreUsuario);
    }

    // Eliminar presupuesto
    async eliminarPresupuesto(idPresupuesto, nombreUsuario) {
        const eliminado = await presupuestoRepository.delete(idPresupuesto, nombreUsuario);
        if (!eliminado) {
            throw new Error('Error al eliminar el presupuesto');
        }
        return true;
    }

    // Obtener todos los presupuestos de un usuario
    async obtenerPresupuestosPorUsuario(nombreUsuario) {
        const presupuestos = await presupuestoRepository.findByUser(nombreUsuario);
        
        // Para cada presupuesto, obtener detalles básicos
        const presupuestosConDetalles = await Promise.all(
            presupuestos.map(async (presupuesto) => {
                const detalles = await detallePresupuestoRepository.findByPresupuesto(presupuesto.idPresupuesto);
                return {
                    ...presupuesto.toJSON(),
                    detalles: detalles.map(d => d.toJSON())
                };
            })
        );

        return presupuestosConDetalles;
    }
}

module.exports = new PresupuestoService();