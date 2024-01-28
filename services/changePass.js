const User = require("../models/User")
const bcrypt = require("bcryptjs")



// Функция для изменения пароля пользователя
async function changePassword(userId, newPassword) {
    try {
      // Найдите пользователя по ID
      const user = await User.findById(userId);
  
      if (!user) {
        console.log('Пользователь не найден');
        return false;
      }
  
      // Хешируйте новый пароль
      const hashPassword = await bcrypt.hash(newPassword, 8);
  
      // Обновите поле пароля
      user.password = hashPassword;
  
      // Сохраните изменения в базе данных
      await user.save();
      console.log('Пароль успешно изменен');
      return true;
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      return false;
    } finally {
      // Закройте соединение с базой данных
      mongoose.disconnect();
    }
  }

  module.exports = { changePassword };