const asyncHandler = require('express-async-handler')
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 600 } )
const Movie = require('../models/Movie')
const TV = require('../models/TV')
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;

const movie_url_1 = `${base_url}trending/movie/week?api_key=${api_key}&language=en-US&page=1`;
const tv_url_1 = `${base_url}trending/tv/week?api_key=${api_key}&language=en-US&page=1`;

async function getData() {
    const page_movie = await fetch(movie_url_1);
    const page_tv = await fetch(tv_url_1);
    const json_movie = await page_movie.json()
    const json_tv = await page_tv.json()
    const res_movie = json_movie.results
    const res_tv = json_tv.results
    return [
        res_movie,
        res_tv
    ]
}

async function check_movie(res_movie, array) {
    const promise1 = await (res_movie|| []).map(async card => {
        const movies_FromDb = await Movie.findOne({ _id: card.id }).lean()
            if (movies_FromDb !== null && card.vote_average > 7) {
                array.push(movies_FromDb);
            }
        });
    await Promise.all(promise1);
}

async function check_tv(res_tv, array) {
    const promise1 = await (res_tv|| []).map(async card => {
        const tv_FromDb = await TV.findOne({ _id: card.id }).lean()
            if (tv_FromDb !== null && card.vote_average > 7.6) {
                array.push(tv_FromDb);
            }
        });
    await Promise.all(promise1);
}

async function getMultipleRandom(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

async function main() {
    const array = []
    const response = await getData()
    const res_movie = await response[0]
    const res_tv = await response[1]
    await check_movie(res_movie, array)
    await check_tv(res_tv, array)
    const res = await getMultipleRandom(array, 8);
    return res
}


const getSlider = asyncHandler(async(req, res) => {
    value = myCache.get( `slider` );
    if ( value == undefined ) {
        const resp = await main();
        const result = {
            page: 'slider',
            results: resp
        }
        myCache.set( `slider`, result, 28800 );
        res.json(result)
    }
    else {
        const result = myCache.get( `popular/movie` );
        res.json(result);
    }
})

module.exports = { getSlider }