const asyncHandler = require('express-async-handler')
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

// async function sort(array){
//     const sortarr = array.sort(function(a, b){
//         let nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
//         if (nameA < nameB)
//             return -1;
//         if (nameA > nameB)
//             return 1;
//         return 0;
//     })
//     sortarr.unshift({ id: 0, name: 'Popular & Latest'})
//     return sortarr
// }

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
    result.unshift({ id: 0, name: 'Popular & Latest'})
    return result
}

const getGenreList = asyncHandler(async(req, res) => {
    const resp = await main()
    const result = {
        page: "genre/list",
        genres: resp
    }
    res.json(result)
})

const getGenreCard = asyncHandler(async(req, res) => {
    const id = req.params.id
    res.json({message: `this is the ${id} Cards`})
})

module.exports = { getGenreList, getGenreCard }