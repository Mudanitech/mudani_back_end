var mongoose = require('mongoose');
var Schema = mongoose.Schema
var Usernotification = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    status: {
        type: Number,
        trim: true,
        default: 0
    },
}, {
    timestamps: true
})
module.exports = mongoose.model('usernotifications', Usernotification);
