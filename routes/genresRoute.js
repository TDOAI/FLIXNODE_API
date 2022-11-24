const express = require('express')
const genresController = require('../controllers/genresController')
const router = express.Router()

router.route('/list')
    .get(genresController.getGenreList)

router.route('/:id')
    .get(genresController.getGenreCard)

module.exports = router