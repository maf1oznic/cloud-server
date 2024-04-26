const express = require("express")
const mongoose = require("mongoose")
const config = require("config")
const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth.routes")
const fileRouter = require("./routes/file.routes")
const userRoute = require('./routes/userRoute')
const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const corsMiddleware = require('./middleware/cors.middleware')
const filePathMiddleware = require('./middleware/filepath.middleware')
const path = require('path')

app.use(fileUpload({
    defCharset: 'utf8',
    defParamCharset: 'utf8'
}));
app.use(corsMiddleware)
app.use(filePathMiddleware(path.resolve(__dirname, 'files')))
app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)
app.use('/api/user', userRoute);

const start = async () => {
    try {
            await mongoose.connect(config.get('dbUrl'))

        app.listen(PORT, () => {
            console.log('Server started on port', PORT)
        })
    } catch (e) {

    }
}

start()
