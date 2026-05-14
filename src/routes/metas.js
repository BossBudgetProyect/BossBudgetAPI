const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');
const { authMiddleware } = require('../middlewares/auth');

// Rutas principales
router.get('/', authMiddleware, metaController.listarMetas);
router.get('/estadisticas', authMiddleware, metaController.obtenerEstadisticas);
router.get('/:id', authMiddleware, metaController.obtenerMeta);
router.post('/', authMiddleware, metaController.crearMeta);
router.put('/:id', authMiddleware, metaController.actualizarMeta);
router.patch('/:id/progreso', authMiddleware, metaController.actualizarProgreso);
router.delete('/:id', authMiddleware, metaController.eliminarMeta);

module.exports = router;