const mongoose = require('mongoose');
const Model = mongoose.Schema({
    type: {                 //1=portfolio , 2=thematic basket
        type: Number,
        trim: true,
        default: 1,
    },
    modelName: {
        type: String,
        trim: true,
        require: true,
    },
    orbisModelId: {
        type: Number,
        trim: true,
        require: true,
    },
    maximumDeviationAllowance: {
        type: String,
        trim: true,
        require: true,
    },
    adjustedFrequency: {
        type: String,
        trim: true,
        require: true,
    },
    description: {
        type: String,
        trim: true,
        require: true,
    },
    models: {
        type: Array,
        trim: true,
        default: []
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('model', Model);