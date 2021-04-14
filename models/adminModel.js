const bcrypt = require('bcryptjs');
const saltRounds = 10;

var mongoose = require('mongoose');
var Admin = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
    },
    rememberMe: {
        type: Boolean
    },
    profilePic: {
        type: String
    },
    jwtToken: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
}, {
    timestamps: true
})
const AdminModel = mongoose.model('admins', Admin);
module.exports = AdminModel
AdminModel.findOne({}, (error, success) => {
    if (error) {
        console.log(error)
    } else {
        if (!success) {
            bcrypt.genSalt(saltRounds, (err, salt) => {
                bcrypt.hash('admin123', salt, (err, hash) => {
                    if (err) {
                        console.log('err is ===========>', err)
                    } else {
                        new AdminModel({
                            name: "admin",
                            email: "admin@gmail.com",
                            password: hash,
                            profilePic: "https://res.cloudinary.com/boss8055/image/upload/v1552474453/cs9axszxjxnomqncyjjl.jpg"
                        }).save((error, success) => {
                            if (error) {
                                console.log("Error in creating admin");
                            } else {
                                console.log("Admin created successfully");
                                console.log("Admin data is==========>", success);
                            }
                        })
                    }
                })
            })
        }
    }
})
