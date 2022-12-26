const express = require('express')
const TVShow = require('../controllers/TVShowController')
const router = express.Router()

router.route('/episodes/:stream_id')
    .get(TVShow.getEpisodeCount)

module.exports = router