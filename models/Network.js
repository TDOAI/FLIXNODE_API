const mongoose = require("mongoose");

const NetworksSchema = new mongoose.Schema({
    _id: { type: Number },
    name: { type: String, require: true },
    headquarters: { type: String },
    homepage: { type: String },
    logo_path: { type: String },
    list: [Number]
},
{
    versionKey: false
}
)

module.exports = mongoose.model('Network', NetworksSchema)