const express = require('express')
const sliderController = require('../controllers/sliderController')
const router = express.Router()

router.route('/')
    .get(sliderController.getSlider)

module.exports = router