var mongoose = require('mongoose');
var Thematic = mongoose.Schema({
    thematicName: {
        type: String,
        trim: true,
        require: true
    },
    thematicDescription: {
        type: String,
        trim: true,
        require: true
    },
    thematicImage: {
        type: String,
        trim: true,
        require: true
    },
    thematicStatus: {
        type: Boolean,
        trim: true,
        default: true
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('thematic', Thematic);
