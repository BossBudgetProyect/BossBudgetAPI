const presupuestoService = require('../services/presupuestoService');

class PresupuestoController {
    
    // Crear presupuesto
    async crearPresupuesto(req, res) {
        try {
            const { nombre, valor, fecha_inicio, fecha_fin, categoria, otraCategoria } = req.body;
            
            // ✅ VALIDACIÓN: Verificar si el usuario ya tiene un presupuesto
            const presupuestosExistentes = await presupuestoService.obtenerPresupuestosPorUsuario(
                req.user.nombreUsuario
            );
            
            // Si ya existe al menos un presupuesto, rechazar la creación
            if (presupuestosExistentes && presupuestosExistentes.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Ya tienes un presupuesto activo. Solo puedes tener un presupuesto por usuario. Usa el endpoint de actualización (PUT) para modificar el existente.'
                });
            }
            
            // Determinar categoría final
            const categoriaFinal = categoria === 'Otros' && otraCategoria?.trim() !== '' 
                ? otraCategoria.trim() 
                : categoria;

            // Datos para el presupuesto
            const presupuestoData = {
                fecha: new Date(),
                idTipoPresupuesto: 2, // Mensual por defecto
                dinero: 0,
                ahorros: 0,
                nombreUsuario: req.user.nombreUsuario // Del JWT
            };

            // Datos para el detalle
            const detalleData = {
                nombre: nombre,
                monto: parseFloat(valor),
                fecha_inicio: fecha_inicio,
                fecha_fin: fecha_fin,
                categoria: categoriaFinal
            };

            const resultado = await presupuestoService.crearPresupuestoConDetalle(presupuestoData, detalleData);
            
            res.status(201).json({
                success: true,
                message: 'Presupuesto creado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Obtener presupuesto completo
    async obtenerPresupuesto(req, res) {
        try {
            const { id } = req.params;
            const resultado = await presupuestoService.obtenerPresupuestoCompleto(
                id, 
                req.user.nombreUsuario
            );
            
            res.json({
                success: true,
                data: resultado
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    // Obtener todos los presupuestos del usuario
    async obtenerPresupuestosUsuario(req, res) {
        try {
            const presupuestos = await presupuestoService.obtenerPresupuestosPorUsuario(
                req.user.nombreUsuario
            );
            
            res.json({
                success: true,
                data: presupuestos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Actualizar presupuesto
    async actualizarPresupuesto(req, res) {
        try {
            const { id } = req.params;
            
            // ✅ NUEVO: Verificar que el presupuesto existe antes de actualizar
            const presupuestosUsuario = await presupuestoService.obtenerPresupuestosPorUsuario(
                req.user.nombreUsuario
            );
            
            if (!presupuestosUsuario || presupuestosUsuario.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No tienes un presupuesto creado. Primero debes crear uno.'
                });
            }
            
            // Verificar que el ID del presupuesto pertenece al usuario
            const presupuestoValido = presupuestosUsuario.find(p => p.idPresupuesto == id);
            if (!presupuestoValido) {
                return res.status(404).json({
                    success: false,
                    error: 'Presupuesto no encontrado o no te pertenece'
                });
            }
            
            const resultado = await presupuestoService.actualizarPresupuesto(
                id,
                req.user.nombreUsuario,
                req.body
            );
            
            res.json({
                success: true,
                message: 'Presupuesto actualizado correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Eliminar presupuesto
    async eliminarPresupuesto(req, res) {
        try {
            const { id } = req.params;
            
            // ✅ NUEVO: Verificar que el presupuesto existe antes de eliminar
            const presupuestosUsuario = await presupuestoService.obtenerPresupuestosPorUsuario(
                req.user.nombreUsuario
            );
            
            if (!presupuestosUsuario || presupuestosUsuario.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No tienes un presupuesto para eliminar'
                });
            }
            
            // Verificar que el ID del presupuesto pertenece al usuario
            const presupuestoValido = presupuestosUsuario.find(p => p.idPresupuesto == id);
            if (!presupuestoValido) {
                return res.status(404).json({
                    success: false,
                    error: 'Presupuesto no encontrado o no te pertenece'
                });
            }
            
            await presupuestoService.eliminarPresupuesto(id, req.user.nombreUsuario);
            
            res.json({
                success: true,
                message: 'Presupuesto eliminado correctamente'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new PresupuestoController();