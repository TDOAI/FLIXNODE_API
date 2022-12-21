const asyncHandler = require('express-async-handler')
const { MOVIES } = require('@consumet/extensions')


function countLastEpisode(arr) {
    const seasons =  arr.reduce((acc, obj) => {
        if (acc[obj.season]) {
            acc[obj.season]++;
        } else {
            acc[obj.season] = 1;
        }
        return acc;
    }, {});
    const lastSeason = Math.max(...Object.keys(seasons));
    const lastEpisode = seasons[lastSeason];
    return {
        Season: lastSeason,
        Episode: lastEpisode
    }
}

const getEpisodeCount = asyncHandler(async (req, res) => {
    const stream_id = req.params.stream_id
    const show = new MOVIES.FlixHQ();
    const data = await show.fetchMediaInfo(`tv/watch-${stream_id}`)
    res.json(countLastEpisode(data.episodes))
})

module.exports = { getEpisodeCount }

