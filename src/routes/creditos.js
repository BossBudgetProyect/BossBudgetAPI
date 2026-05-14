const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/creditoController');
const { authMiddleware } = require('../middlewares/auth');

// Crear crédito
router.post('/', authMiddleware, creditoController.crearCredito);

// Registrar pago de crédito
router.post('/pago', authMiddleware, creditoController.registrarPago);

// Obtener resumen de créditos del usuario autenticado
router.get('/mi-resumen', authMiddleware, creditoController.miResumenCreditos);

// Obtener todos los créditos del usuario autenticado
router.get('/mis-creditos', authMiddleware, creditoController.misCreditos);

// Obtener créditos de un presupuesto específico
router.get('/presupuesto/:idPresupuesto', authMiddleware, creditoController.obtenerCreditosPorPresupuesto);

// Obtener crédito específico
router.get('/:id', authMiddleware, creditoController.obtenerCredito);

// Actualizar crédito
router.put('/:id', authMiddleware, creditoController.actualizarCredito);

// Eliminar crédito
router.delete('/:id', authMiddleware, creditoController.eliminarCredito);

module.exports = router;