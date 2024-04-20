const path = require('path');

function filePath(filePath) {
    return function(req, res, next) {
        req.filePath = path.resolve(filePath);
        next();
    };
}

module.exports = filePath;
