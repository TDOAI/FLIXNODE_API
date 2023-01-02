const asyncHandler = require('express-async-handler')
const Card = require('../models/Card');
const Network = require('../models/Network');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));


const base_url = process.env.BASE_URL;
const api_key = process.env.API_KEY;

const available_network = [
    {
        name: "netflix",
        id: 213,
        list: [213]
    },
    {
        name: "hbo",
        id: 3186,
        list: [49, 3186, 5479, 2593, 1590, 1089, 1129]
    },
    {
        name: "disney",
        id: 2739,
        list: [2739, 44, 2324, 5137, 6006, 54, 2326]
    },
    {
        name: "apple",
        id: 2552,
        list: [2552]
    },
    {
        name: "hulu",
        id: 453,
        list: [453, 1772]
    },
    {
        name: "amazon",
        id: 1024,
        list: [1024, 5533]
    },
    {
        name: "peacock",
        id: 3353,
        list: [3353]
    },
    {
        name: "paramount",
        id: 4330,
        list: [4330, 2076, 2604, 5506, 5511, 5567, 6100, 6101, 6183, 6318, 6445]
    }
]

const fetch_networks = async () => {
    try {
        const networks = await Promise.all(available_network.map(async (e) => {
            const response = await fetch(`${base_url}network/${e.id}?api_key=${api_key}`);
            const res = await response.json()
            delete Object.assign(res, { _id: res.id })['id'];
            res["list"] = e.list
            const query = { _id: res._id };
            const update = { $set: res };
            const options = { upsert: true };
            await Network.updateOne(query, update, options);
            return res
        }))
        return networks
    } catch (error) {
        throw new Error(`Unable to get the response`);
    }
};


const getNetworkList = asyncHandler(async (req, res) => {
    const rest = await fetch_networks()
    const result = {
        page: "network/list",
        networks: rest
    }
    res.json(result)
})

const getNetworkCard = asyncHandler(async (req, res) => {
    const network = await Network.find({}, { name: 1, list: 1 }).lean()
    const param = req.params.id
    const id = parseInt(param)
    const getListById = id => {
        const object = network.find(item => item._id === id);
        return object ? object.list : null;
    };
    const list = getListById(id);
    if (list) {
        let { page } = req.query
        if (!page) page = 1;
        const limit = 20
        const skip = (page - 1) * limit
        const sort = { popularity: -1 }
        const query = { "networks.id": list }
        const count = await Card.find(query).where({ media_type: 'tv' }).countDocuments()
        const result = await Card.find(query).where({ media_type: 'tv' }).sort(sort).skip(skip).limit(limit)
        let hasNext
        if (page < Math.ceil(count / 20)) {
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
        const result = network.map(obj => {
            const newObj = { ...obj };
            delete newObj.list;
            return newObj;
        });
        const document = {
            success: false,
            message: "Please Use One The Available Network",
            network: result
        }
        res.status(409).json(document)
    }
})

module.exports = { getNetworkList, getNetworkCard }