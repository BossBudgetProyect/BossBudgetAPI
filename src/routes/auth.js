// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const multer = require('multer');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Rutas públicas
router.post('/login', authController.login);
router.post('/registrar', upload.single('foto'), authController.registrar);

// Rutas protegidas
router.get('/perfil', authMiddleware, authController.obtenerPerfil);
router.put('/perfil', authMiddleware, authController.actualizarPerfil); // NUEVO
router.put('/cambiar-password', authMiddleware, authController.cambiarContraseña); // NUEVO
router.post('/logout', authController.logout);

module.exports = router;