const path = require('path');
const fileService = require("../services/fileService");
const config = require("config");
const fs = require("fs");
const User = require("../models/User");
const File = require("../models/File");
// const Uuid = require('uuid')

class FileController {
    async createDir(req, res) {
        try {
            const { name, type, parent } = req.body;
            const file = new File({ name, type, parent, user: req.user.id });
            const parentFile = await File.findOne({ _id: parent });
            
            if (!parentFile) {
                file.path = path.join(req.filePath, name); // используем path.join для формирования полного пути
                await fileService.createDir(req, file);
            } else {
                file.path = path.join(parentFile.path, name); // используем path.join для формирования полного пути
                await fileService.createDir(req, file);
                parentFile.childs.push(file._id);
                await parentFile.save();
            }
            
            await file.save();
            return res.json(file);
        } catch (e) {
            console.log(e);
            return res.status(400).json(e);
        }
    }

    async getFiles(req, res) {
        try {
            const {sort} = req.query
            let files
            switch (sort) {
                case 'name':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({name:1})
                    break
                case 'type':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({type:1})
                    break
                case 'date':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({date:1})
                    break
                case 'size':
                    files = await File.find({user: req.user.id, parent: req.query.parent}).sort({size:1})
                    break
                default:
                    files = await File.find({user: req.user.id, parent: req.query.parent})
                    break;
            }

            return res.json(files);
        } catch (e) {
            console.log(e);
            return res
                .status(500)
                .json({ message: "Не удается получить файлы" });
        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file;

            const parent = await File.findOne({
                user: req.user.id,
                _id: req.body.parent,
            });
            const user = await User.findOne({ _id: req.user.id });

            if (user.usedSpace + file.size > user.diskSpace) {
                return res.status(400).json({ message: "На диске нет свободного места" });
            }

            user.usedSpace = user.usedSpace + file.size;

            let filePath;
            if (parent) {
                filePath = path.join(req.filePath, user._id.toString(), parent.path, file.name); // используем path.join для формирования полного пути
            } else {
                filePath = path.join(req.filePath, user._id.toString(), file.name); // используем path.join для формирования полного пути
            }

            if (fs.existsSync(filePath)) {
                return res.status(400).json({ message: "Файл уже существует" });
            }

            file.mv(filePath);

            const type = file.name.split(".").pop();
            let dbFilePath = file.name;
            if (parent) {
                dbFilePath = path.join(parent.path, file.name); // используем path.join для формирования полного пути
            }

            const dbFile = new File({
                name: file.name,
                type,
                size: file.size,
                path: dbFilePath,
                parent: parent ? parent._id : null,
                user: user._id,
            });

            await dbFile.save();
            await user.save();

            res.json(dbFile);
        } catch (e) {
            console.log(e);
            return res.status(500).json({ message: "Ошибка загрузки" });
        }
    }

    async downloadFile(req, res) {
        try {
            const file = await File.findOne({
                _id: req.query.id,
                user: req.user.id,
            });
            const path = fileService.getPath(req, file);
            if (fs.existsSync(path)) {
                return res.download(path, file.name);
            }
            return res.status(400).json({ message: "Ошибка загрузки" });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: "Ошибка загрузки" });
        }
    }

    async deleteFile(req, res) {
        try {
            const file = await File.findOne({
                _id: req.query.id,
                user: req.user.id,
            });
            if (!file) {
                return res.status(400).json({ message: "Файл не найден" });
            }

            const user = await User.findOne({ _id: req.user.id });
            user.usedSpace = Math.max(user.usedSpace - file.size, 0); // Уменьшаем, но не уходим в отрицательное значение
            await user.save();

            fileService.deleteFile(req, file);
            await File.deleteOne({ _id: file._id });
            // return res.json({message: 'File was deleted'})
            return res.status(204).end();
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: "Каталог не пуст" });
        }
    }

    async searchFile(req, res) {
        try {
            const searchName = req.query.search
            let files = await File.find({user: req.user.id})
            files = files.filter(file => file.name.includes(searchName))
            return res.json(files)
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: 'Search error'})
        }
    }

    // async uploadAvatar(req, res) {
    //     try {
    //         const file = req.files.file
    //         const user = await User.findById(req.user.id)
    //         const avatarName = Uuid.v4() + ".jpg"
    //         file.mv(config.get('staticPath') + "\\" + avatarName)
    //         user.avatar = avatarName
    //         await user.save()
    //         return res.json(user)
    //     } catch (e) {
    //         console.log(e)
    //         return res.status(400).json({message: 'Upload avatar error'})
    //     }
    // }

    // async deleteAvatar(req, res) {
    //     try {
    //         const user = await User.findById(req.user.id)
    //         fs.unlinkSync(config.get('staticPath') + "\\" + user.avatar)
    //         user.avatar = null
    //         await user.save()
    //         return res.json(user)
    //     } catch (e) {
    //         console.log(e)
    //         return res.status(400).json({message: 'Delete avatar error'})
    //     }
    // }
}

module.exports = new FileController();
