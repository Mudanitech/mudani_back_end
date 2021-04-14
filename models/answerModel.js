var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Answers = mongoose.Schema({
    questionnaireId: {
        type: Schema.Types.ObjectId,
        ref: 'questionnaire'
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'questions'
    },
    answer: {
        type: String,
        trim: true
    },
    value: {
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
module.exports = mongoose.model('answers', Answers);
