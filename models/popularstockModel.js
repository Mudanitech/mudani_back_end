const mongoose = require('mongoose');
const Popularstoks = mongoose.Schema({
    tickerType: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 0
    },
    tickerImage: {
        type: String,
        trim: true,
        require: true,
    },
    symbol: {
        type: String,
        trim: true,
        require: true,
    },
    companyName: {
        type: String,
        trim: true,
        require: true,
    },
    isin: {
        type: String,
        trim: true,
        require: true,
    },
    cusip: {
        type: String,
        trim: true,
        require: true,
    },
    country: {
        type: String,
        trim: true,
        require: true,
    },
    mic: {
        type: String,
        trim: true,
        require: true,
    },
    currency: {
        type: String,
        trim: true,
        require: true,
    },
    source: {
        type: String,
        trim: true,
        require: true,
    },
    identType: {
        type: String,
        trim: true,
        require: true,
    },
    exchange: {
        type: String,
        trim: true,
        require: true,
    },
    status: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 1
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('popularstock', Popularstoks);