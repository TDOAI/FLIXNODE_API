const asyncHandler = require('express-async-handler')
const { MOVIES } = require('@consumet/extensions')

function changeTitles(episodes, transformFn) {
    // Create a new array of episodes with modified titles
    episodes.forEach(episode => {
        delete episode.url;
    });
    const modifiedEpisodes = episodes.map(episode => {
        const modifiedEpisode = { ...episode };
        modifiedEpisode.title = transformFn(modifiedEpisode.title);
        return modifiedEpisode;
    });
    return modifiedEpisodes;
}

function removeEpisodeNumber(title) {
    return title.replace(/^[^:]+:\s*/i, '');
}

function getSeasons(episodes) {
    // Group episodes by season
    let currentSeason = null;
    let currentEpisodeNumber = 1;
    const seasons = episodes.reduce((acc, episode) => {
        if (episode.season !== currentSeason) {
            currentSeason = episode.season;
            if (episodes[0].number === 0) {
                currentEpisodeNumber = 0;
            } else {
                currentEpisodeNumber = 1;
            }
        }
        episode.number = currentEpisodeNumber;
        currentEpisodeNumber++;
        const season = episode.season;
        if (!acc[season]) {
            acc[season] = [];
        }
        acc[season].push(episode);
        return acc;
    }, {});

    let lastSeason = Math.max(...Object.keys(seasons));
    let lastEpisode = seasons[lastSeason][seasons[lastSeason].length - 1];

    // Find the last episode of each season
    const seasonsWithLastEpisode = Object.keys(seasons).map(season => {
        const episodes = seasons[season];
        return {
            season: season,
            episodes: episodes,
        };
    });
    return {
        last_released_episode_available: lastEpisode,
        seasons: seasonsWithLastEpisode
    }
}

// function last_released_episode (episodes) {
//     episodes.sort(function(a, b) {
//         return b.season - a.season;
//       });
//       const lastSeason = episodes[0].season;
//       const lastSeasonEpisodes = episodes.filter(function(episode) {
//         return episode.season === lastSeason;
//       });
//       lastSeasonEpisodes.map(function(episode, index) {
//         episode.number = index + 1;
//       });
//       lastSeasonEpisodes.sort(function(a, b) {
//         return b.number - a.number;
//       });
//       const lastEpisode = lastSeasonEpisodes[0];
//       return lastEpisode
// }

const getEpisodeCount = asyncHandler(async (req, res) => {
    const stream_id = req.params.stream_id
    const show = new MOVIES.FlixHQ();
    const data = await show.fetchMediaInfo(`tv/watch-${stream_id}`)
    const EpisodesArray = data.episodes
    const modifiedEpisodes = changeTitles(EpisodesArray, removeEpisodeNumber);
    res.json(getSeasons(modifiedEpisodes))
})

module.exports = { getEpisodeCount }

