var mongoose = require('mongoose');
var Questionnaires = mongoose.Schema({
    title: {
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
module.exports = mongoose.model('questionnaires', Questionnaires);
