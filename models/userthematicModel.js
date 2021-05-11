var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Userthematic = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    thematicId: {
        type: Schema.Types.ObjectId,
        ref: 'thematic'
    },
    modelId: {
        type: Schema.Types.ObjectId,
        ref: 'model'
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('Userthematics', Userthematic);
