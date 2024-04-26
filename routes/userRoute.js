const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/userController');

// Маршрут для получения информации о дисковом пространстве пользователя
router.get('/disk-space', authMiddleware, userController.getUserDiskSpace);

module.exports = router;
