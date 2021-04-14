var mongoose = require('mongoose');
var Refer = mongoose.Schema({
    yourName: {
        type: String,
        trim: true
    },
    yourEmail: {
        type: String,
        trim: true
    },
    friendName: {
        type: String,
        trim: true
    },
    friendEmail: {
        type: String,
        trim: true
    },
    friendPhone: {
        type: String,
        trim: true
    },
    stockName: {
        type: String,
        trim: true
    },
    stockImage: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('refers', Refer);
