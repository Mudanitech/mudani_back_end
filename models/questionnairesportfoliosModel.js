var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Questionnairesportfolios = mongoose.Schema({
    questionnaireId: {
        type: Schema.Types.ObjectId,
        ref: 'questionnaire'
    },
    portfolioId: {
        type: Schema.Types.ObjectId,
        ref: 'portfolio'
    },
    questionnaireId: {
        type: Schema.Types.ObjectId,
        ref: 'questionnaire'
    },
    modelId: {
        type: Schema.Types.ObjectId,
        ref: 'model'
    },
    minScore: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 0
    },
    maxScore: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 0
    },

}, {
    timestamps: true
})
module.exports = mongoose.model('questionnairesportfolios', Questionnairesportfolios);
