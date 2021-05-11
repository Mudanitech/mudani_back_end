var mongoose = require('mongoose');
var Mobileverification = mongoose.Schema({
    countryCode: {
        type: String,
        trim: true
    },
    mobileNo: {
        type: String,
        trim: true
    },
    otp: {
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
module.exports = mongoose.model('mobileverifications', Mobileverification);
