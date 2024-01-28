const Router = require("express");
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../services/fileService')
const File = require('../models/File')
// const { changePassword } = require('../services/changePass');

router.post('/registration', 
    [
        check('email', "Неверный адрес электронной почты").isEmail(),
        check('password', 'Пароль должен быть длиннее 3 и короче 12 символов').isLength({min:3, max:12})
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Неправильный запрос", errors})
        }

        const {username, email, password} = req.body;

        const candidate = await User.findOne({email})

        if(candidate) {
            return res.status(400).json({message: `Пользователь с электронной почтой ${email} уже существует`})
        }
        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({username, email, password: hashPassword})
        await user.save()
        await fileService.createDir(req, new File({user:user.id, name: ''}))
        return res.json({message: "Пользователь создан"})

    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})


router.post('/login',
    async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: "Пользователь не найден"})
        }
        const isPassValid = bcrypt.compareSync(password, user.password)
        if (!isPassValid) {
            return res.status(400).json({message: "Неверный пароль"})
        }
        const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })

    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})



router.get('/auth', authMiddleware,
    async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user.id})
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
    } catch (e) {
        console.log(e)
        res.send({message: "Server error"})
    }
})


// router.post('/change-password',
// [
//   check('userId', 'Неверный ID пользователя').isMongoId(),
//   check('newPassword', 'Пароль должен быть длиннее 3 и короче 12 символов').isLength({ min: 3, max: 12 })
// ],
// async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ message: 'Неправильный запрос', errors });
//     }

//     const { userId, newPassword } = req.body;

//     const success = await changePassword(userId, newPassword);

//     if (success) {
//       return res.json({ message: 'Пароль успешно изменен' });
//     } else {
//       return res.status(400).json({ message: 'Не удалось изменить пароль' });
//     }
//   } catch (e) {
//     console.error('Ошибка при изменении пароля:', e);
//     res.status(500).json({ message: 'Ошибка на сервере' });
//   }
// }
// );


module.exports = router
