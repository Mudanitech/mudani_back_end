var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Thematic = mongoose.Schema({
    modelId: {
        type: Schema.Types.ObjectId,
        ref: 'model'
    },
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
        type: Number,
        trim: true,
        default: 1
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('thematic', Thematic);
