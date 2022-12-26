const express = require('express')
const networksController = require('../controllers/networksController')
const router = express.Router()

router.route('/list')
    .get(networksController.getNetworkList)

router.route('/:id')
    .get(networksController.getNetworkCard)


module.exports = router