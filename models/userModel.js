var mongoose = require('mongoose');
var Schema = mongoose.Schema
var User = mongoose.Schema({
    email: {
        type: String,
        trim: true
    },
    userName: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    middleName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    countryCode: {
        type: String,
        trim: true
    },
    mobileNo: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    interestedAccount: {            // 1=self-Direct Account ,2=managed Account ,3=dual Journey Account
        type: Number,
        trim: true,
        default: 0
    },
    accountType: {                  // 1=Individual ,2=Joint ,3=Retirement
        type: Number,
        trim: true,
        default: 0
    },
    deviceType: {                   // 1=Android ,2=IOS
        type: String,
        trim: true,
        default: 0
    },
    deviceId: {
        type: String,
        trim: true,
    },
    deviceToken: {
        type: String,
        trim: true
    },
    status: {                       // 1=Verified Account ,2=Blocked By Admin 
        type: Number,
        trim: true,
        default: 1
    },
    profileUpdated: {           // 1=profile updated
        type: Number,
        trim: true,
        default: 0
    },
    timezone: {
        type: String,
        trim: true
    },
    orbisToken: {
        type: String,
        trim: true
    },
    orbisUserId: {
        type: Number,
        trim: true,
        default: 0
    },
    applicationId: {
        type: Number,
        trim: true,
        default: 0
    },
    userBasket: {
        type: Array,
        trim: true,
        default: 0
    },
    // userPortfolio: {
    //     type: Array,
    //     trim: true,
    //     default: 0
    // },
    portfolioId: {
        type: Schema.Types.ObjectId,
        ref: 'portfolio'
    },
    planId: {
        type: Schema.Types.ObjectId,
        ref: 'portfolio'
    },
    thematic: {
        type: Array,
        ref: 'portfolio'
    },
    jwtToken: {
        type: String,
        trim: true
    },
    ssn: {
        type: String,
        trim: true
    },
    dob: {
        type: String,
        trim: true
    },
    address1: {
        type: String,
        trim: true
    },
    address2: {
        type: String,
        trim: true
    },
    zipcode: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('users', User);
