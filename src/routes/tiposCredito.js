const express = require('express');
const router = express.Router();
const tipoCreditoController = require('../controllers/tipoCreditoController');
const { authMiddleware } = require('../middlewares/auth');

// Obtener todos los tipos de crédito (público, se puede usar sin auth si quieres)
router.get('/', tipoCreditoController.obtenerTodosTipos);

// Obtener tipo de crédito específico
router.get('/:id', tipoCreditoController.obtenerTipoPorId);

// Crear nuevo tipo de crédito (solo admin)
router.post('/', authMiddleware, tipoCreditoController.crearTipo);

// Actualizar tipo de crédito (solo admin)
router.put('/:id', authMiddleware, tipoCreditoController.actualizarTipo);

// Eliminar tipo de crédito (solo admin)
router.delete('/:id', authMiddleware, tipoCreditoController.eliminarTipo);

module.exports = router;