const User = require('../models/User'); // Подключаем модель пользователя

// Функция для получения информации о дисковом пространстве пользователя
const getUserDiskSpace = async (req, res) => {
    try {
        // Логика получения информации о пользователе
        const user = await User.findOne({ _id: req.user.id });

        // Отправка информации о дисковом пространстве в формате JSON
        res.json({
            usedSpace: user.usedSpace,
            diskSpace: user.diskSpace,
        });
    } catch (error) {
        console.error('Ошибка при получении информации о дисковом пространстве:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

module.exports = {
    getUserDiskSpace,
};
