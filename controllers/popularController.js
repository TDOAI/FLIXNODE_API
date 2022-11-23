const Movie = require('../models/Movie')
const TV = require('../models/TV')
const asyncHandler = require('express-async-handler')

const getPopular = asyncHandler(async (req, res) => {
    const type = req.params.type
    const query = {};
    const sort = { popularity: -1 };
    const top25 = 25
    if ( type == 'movie' ) {
        const result = await Movie.find(query).limit(top25).sort(sort).lean()
        return res.json(result)
    }
    else if (type == 'tv') {
        const result = await TV.find(query).limit(top25).sort(sort).lean()
        return res.json(result)
    }
    else {
        return res.status(409).json({ 
            message: 'Please Use Appropriate Type',
            type1: 'movie',
            type2: 'tv'
        })
    }
})

const getRoute = asyncHandler(async (req, res) => {
    return res.status(400).json({ message: 'Type Not Found. PLease Choose between /tv or /movie' })
})

module.exports = { getPopular, getRoute }