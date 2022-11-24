const mongoose = require("mongoose");

const GenresSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, require: true },
    type: { type: String }
},
{
    versionKey: false
}
)

module.exports = mongoose.model('Genre', GenresSchema)