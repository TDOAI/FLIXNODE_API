const asyncHandler = require('express-async-handler')
const Card = require('../models/Card')
const Genre = require('../models/Genres')
const NodeCache = require( "node-cache" )
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 600 } )
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;

const movie_genres = `${base_url}genre/movie/list?api_key=${api_key}&language=en-US`;
const tv_genres = `${base_url}genre/tv/list?api_key=${api_key}&language=en-US`;
    

const fetch_movie = async () => {
    try {
        const response_movie = await fetch(movie_genres);
        const res = await response_movie.json()
        const result_movie = await res.genres
        return result_movie
    } catch (error) {
        throw new Error(`Unable to get the response`);
    }
};

const fetch_tv = async () => {
    try {
        const response_tv = await fetch(tv_genres);
        const res = await response_tv.json()
        const result_tv = await res.genres
        return result_tv
    } catch (error) {
        throw new Error(`Unable to get the response`);
    }
};

const common = async (res_movie, res_tv) => {
    try {
        const cross = []
        const promises = await (res_tv|| []).map(async genre => {
            for (let i = 0 ; i<res_movie.length;i++) {
                if ( res_movie[i].id == genre.id ) {
                    cross.push(genre)
                }
            }
        });
        await Promise.all(promises);
        return cross
    } catch (error) {
      throw new Error(`Unable to get the response for`);
    }
};

async function movie_only (res_movie, cross) {
    const promises = await (cross|| []).map(async genre => {
        const indexof = res_movie.findIndex(obj => {
            return obj.id === genre.id
        })
        res_movie.splice(indexof, 1)
    });
    res_movie.map(obj => {
        obj["type"] = "movie only"
    })
    return res_movie
}

async function tv_only (res_tv, cross) {
    const promises = await (cross|| []).map(async genre => {
        const indexof = res_tv.findIndex(obj => {
            return obj.id === genre.id
        })
        res_tv.splice(indexof, 1)
    });
    res_tv.map(obj => {
        obj["type"] = "tv only"
    })
    return res_tv
}

async function main () {
    const res_movie = await fetch_movie()
    const res_tv = await fetch_tv()
    const cross = await common(res_movie, res_tv)
    const movie = await movie_only(res_movie, cross)
    const tv = await tv_only(res_tv, cross)
    const array = [...cross, ...movie, ...tv]
    // const sorted = await sort(array)
    const promises = (array|| []).map(async card => {
        const query = { _id: card.id };
        const document = {
            _id: card.id,
            name: card.name,
            type: card.type
        }
        const update = { $set: document };
        const options = { upsert: true };
        await Genre.updateOne(query, update, options);
    })
    const sorts = {name: 1}
    const result = await Genre.find({}).sort(sorts).lean()
    result.unshift({ _id: 0, name: 'Popular & Latest'})
    return result
}

const getGenreList = asyncHandler(async(req, res) => {
    value = myCache.get( 'genre/list' );
    if (value == undefined) {
        const resp = await main()
        const result = {
            page: "genre/list",
            genres: resp
        }
        myCache.set( 'genre/list', result, 10800 );
        res.json(result)
    }
    else {
        const result = myCache.get( 'genre/list' );
        res.json(result)
    }
})

const getGenreCard = asyncHandler(async(req, res) => {
    const array = []
    const param = req.params.id
    const id = parseInt(param)
    let { page } = req.query
    if (!page) page=1;
    const limit = 20
    const skip = (page-1)*limit
    const sort = { popularity: -1 }
    const genres = await Genre.find({}, {type: 1}).lean()
    genres.forEach( obj => {
        array.push(obj._id)
    })
    if (array.includes(id)) {
        const query = { "genres.id": id }
        if (genres.find(x => x._id === id && x.type === 'movie only')) {
            const count = await Card.find({}).where({ media_type: 'movie' }).where(query).countDocuments()
            const result = await Card.find({}).where({ media_type: 'movie' }).where(query).sort(sort).skip(skip).limit(limit)
            let hasNext
            if (page < Math.ceil(count/20)) {
                hasNext = true
            }
            else {
                hasNext = false
            }
            const documents = {
                numFound: count,
                page: parseInt(page),
                hasNext: hasNext,
                results: result
            }
            res.json(documents)
        }
        else if (genres.find(x => x._id === id && x.type === 'tv only')) {
            const count = await Card.find({}).where({ media_type: 'tv' }).where(query).countDocuments()
            const result = await Card.find({}).where({ media_type: 'tv' }).where(query).sort(sort).skip(skip).limit(limit)
            let hasNext
            if (page < Math.ceil(count/20)) {
                hasNext = true
            }
            else {
                hasNext = false
            }
            const documents = {
                numFound: count,
                page: parseInt(page),
                hasNext: hasNext,
                results: result
            }
            res.json(documents)
        }
        else {
            const count = await Card.find({}).where(query).countDocuments()
            const result = await Card.find({}).where(query).sort(sort).skip(skip).limit(limit)
            let hasNext
            if (page < Math.ceil(count/20)) {
                hasNext = true
            }
            else {
                hasNext = false
            }
            const documents = {
                numFound: count,
                page: parseInt(page),
                hasNext: hasNext,
                results: result
            }
            res.json(documents)
        }
    }
    else {
        return res.status(409).json({ 
            message: 'Please Provide One of The Following Type',
            types: array
        })
    }
    
})

module.exports = { getGenreList, getGenreCard }