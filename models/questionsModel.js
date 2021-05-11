var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Questions = mongoose.Schema({
    questionnaireId: {
        type: Schema.Types.ObjectId,
        ref: 'questionnaire'
    },
    question: {
        type: String,
        trim: true
    },
    status: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 1
    },
    sort: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 0
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('questions', Questions);
