const express = require('express')
const router = express.Router()
const path = require('path')

router.get('^/$|index(.html)?', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
    } else if (req.accepts('json')) {
        res.json({ message: 'Welcome to Flixnode API' })
    } else {
        res.type('txt').send('Welcome to Flixnode API')
    }
})

module.exports = router