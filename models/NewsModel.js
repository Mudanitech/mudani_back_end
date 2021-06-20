var mongoose = require('mongoose');
var Schema = mongoose.Schema
var News = mongoose.Schema({
    newsId: {
        type: String,
        trim: true
    },
    headline: {
        type: String,
        trim: true
    },
    body: {
        type: String,
        trim: true
    },
    provider: {
        type: String,
        trim: true
    },
    aggregator: {
        type: String,
        trim: true
    },
    xmlBody: {
        type: String,
        trim: true
    },
    language: {
        type: String,
        trim: true
    },
    createdOn: {
        type: String,
        trim: true
    },
    linkOnly: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('news', News);
