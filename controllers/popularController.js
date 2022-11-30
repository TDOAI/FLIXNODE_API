const Card = require('../models/Card')
const asyncHandler = require('express-async-handler')
const NodeCache = require( "node-cache" )
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 600 } )

const getPopular = asyncHandler(async (req, res) => {
    const type = req.params.type
    const query = {};
    const sort = { popularity: -1 };
    const top = 30
    if ( type == 'movie' ) {
        value = myCache.get( 'popular/movie' );
        if ( value == undefined ) {
            const result = await Card.find(query).where({ media_type: 'movie' }).sort(sort).limit(top).lean()
            myCache.set( 'popular/movie', response, 10800 );
            return res.json(result)
        }
        else {
            const result = myCache.get( 'popular/movie' );
            res.json(result);
        }
    }
    else if (type == 'tv') {
        value = myCache.get( 'popular/tv' );
        if ( value == undefined ) {
            const result = await Card.find(query).where({ media_type: 'tv' }).sort(sort).limit(top).lean()
            myCache.set( 'popular/tv', response, 10800 );
            return res.json(result)
        }
        else {
            const result = myCache.get( 'popular/tv' );
            res.json(result);
        }
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