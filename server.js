require('dotenv').config();
const path =  require('path');
const express = require('express');
const compression = require('compression');
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')

const app = express();
const PORT = process.env.PORT || 3500

connectDB()

app.use(cors(corsOptions))

app.use(compression({
    level: 6
}))

app.use(express.json())

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/root'))
app.use('/slider', require('./routes/sliderRoute'))
app.use('/popular', require('./routes/popularRoutes'))
app.use('/genre', require('./routes/genresRoute'))
app.use('/tv_last_ep', require('./routes/TVEpisodeCountRoute'))

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

module.exports = app;