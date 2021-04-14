var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Plan = mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    features: {
        type: Array,
    },
    status: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 1
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('plan', Plan);
