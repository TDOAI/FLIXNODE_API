const express = require('express')
const TVEpisodeCountController = require('../controllers/TVEpisodeCountController')
const router = express.Router()

router.route('/:stream_id')
    .get(TVEpisodeCountController.getEpisodeCount)

module.exports = router