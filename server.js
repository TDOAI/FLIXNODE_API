require('dotenv').config();
const path =  require('path');
const express = require('express');
const compression = require('compression');
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')

const app = express();
const PORT = process.env.PORT || 3500

connectDB()

app.use(compression({
    level: 6,
    threshold: 1*1000,
}))

app.use(express.json())

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'))
app.use('/popular', require('./routes/popularRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
})