var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Portfolio = mongoose.Schema({
    modelId: {
        type: Schema.Types.ObjectId,
        ref: 'model'
    },
    name: {
        type: String,
        trim: true
    },
    riskLevel: {
        type: String,
        trim: true
    },
    drift: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 1
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('portfolio', Portfolio);
