const mongoose = require('mongoose');
const Model = mongoose.Schema({
    modelName: {
        type: String,
        trim: true,
        require: true,
    },
    // existingModel: {
    //     type: String,
    //     trim: true,
    //     require: true,
    // },
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
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('model', Model);