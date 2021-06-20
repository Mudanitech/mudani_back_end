var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Plan = mongoose.Schema({
    type: {                       // 1=self direct ,2=managed 
        type: Number,
        trim: true,
        default: 1
    },
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
    description: {
        type: String,
        trim: true
    },
    bill_time: {                    //1=In Advance , 2=In Arereas
        type: Number,
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
