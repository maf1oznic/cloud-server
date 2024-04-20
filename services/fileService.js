const fs = require('fs');
const path = require('path'); // импортируем модуль path
const File = require('../models/File');
const config = require('config');

class FileService {
    createDir(req, file) {
        const filePath = this.getPath(req, file);
        return new Promise(((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                    return resolve({ message: 'File was created' });
                } else {
                    return reject({ message: "File already exist" });
                }
            } catch (e) {
                return reject({ message: 'File error' });
            }
        }));
    }

    deleteFile(req, file) {
        const filePath = this.getPath(req, file);
        if (file.type === 'dir') {
            fs.rmdirSync(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    }

    getPath(req, file) {
        // используем path.join для формирования пути
        return path.join(req.filePath, String(file.user), file.path);
    }
}

module.exports = new FileService();
