const express = require('express')
const popularController = require('../controllers/popularController')
const router = express.Router()

router.route('/:type')
    .get(popularController.getPopular)

router.route('/')
    .get(popularController.getRoute)

module.exports = router