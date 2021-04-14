const ejs = require('ejs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Refer = require('../models/referModel');
const Admin = require('../models/adminModel');
const response = require('../utils/response');
const config = require('../config/config');
const email = require('../utils/email');
const sms = require('../utils/sms');
const fetch = require('node-fetch');

const adminLogin = async (req, res) => {
    try {
        console.log('config.jwtSecretKey', config.jwtSecretKey)
        response.log("Request for admin login is===========>", req.body);
        req.checkBody('email', 'Your email address is invalid. Please enter a valid address.').isEmail().notEmpty();
        req.checkBody('password', 'Please enter a valid address').notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            let error = errors[0].msg;
            response.log("Field is missing")
            return response.responseHandlerWithMessage(res, 400, error);
        }
        let email = req.body.email.toLowerCase();
        let admin = await Admin.findOne({ email: email });
        if (!admin) {
            response.log("Invalid Credentials")
            return response.responseHandlerWithMessage(res, 405, "Invalid Credentials");
        }
        let comparePassword = await bcryptCompare(req.body.password, admin.password);
        if (!comparePassword) {
            return response.responseHandlerWithMessage(res, 405, "Your password is incorrect");
        }
        let jwtToken = jwt.sign({ _id: admin._id }, config.jwtSecretKey, { expiresIn: '15d' });
        let result = await Admin.findByIdAndUpdate({ _id: admin._id }, { $set: { jwtToken: jwtToken } }, { new: true })
        response.log("Admin has successfully logged in", result)
        return response.responseHandlerWithData(res, 200, "Admin has loggedin successfully", result);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const saveEmail = async (req, res) => {
    try {
        response.log('Request for add user request is===============>', req.body)
        req.checkBody('email', 'Please enter the email').notEmpty();
        const errors = req.validationErrors()
        if (errors) {
            let error = errors[0].msg;
            response.log("Field is missing")
            return response.responseHandlerWithMessage(res, 400, error);
        }
        let checkUser = await User.findOne({ email: req.body.email })
        if (checkUser) {
            response.responseHandlerWithMessage(res, 405, "Your email has already subscribed");
            return
        }
        let Obj = new User({
            email: req.body.email,
        })
        let data = await Obj.save()
        response.responseHandlerWithData(res, 200, "Email has been added sucessfully", data);
    } catch (error) {
        response.log("addUser error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const waitList = async (req, res) => {
    try {
        let result = await User.find({})
        response.responseHandlerWithData(res, 200, "Data found sucessfully", result);
    } catch (error) {
        response.log("addUser error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const sendEmail = async (req, res) => {
    try {
        let checkFriend = await Refer.findOne({ friendEmail: req.body.friendEmail })
        if (checkFriend) {
            response.responseHandlerWithData(res, 405, "you have already shared stock with your friend");
        } else {
            let obj = new Refer({
                yourName: req.body.name,
                yourEmail: req.body.email,
                friendName: req.body.friendName,
                friendEmail: req.body.friendEmail,
                stockName: req.body.stockName,
            })
            let result = await obj.save()
            let mailData = {
                result,
                url: 'https://mudani.com/mudaniNew/#/refer-page/' + result._id
            }
            let html = await ejs.renderFile(__basedir + "/views/mail.ejs", mailData)
            await email.sendEmail(req.body.userEmail, req.body.friendEmail, "Refer a friend", html)
            response.responseHandlerWithData(res, 200, "Mail sent sucessfully", result);
        }
    } catch (error) {
        response.log("send mail error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const sendSMS = async (req, res) => {
    try {

        let checkFriend = await Refer.findOne({ friendPhone: req.body.friendPhone })
        if (checkFriend) {
            response.responseHandlerWithData(res, 405, "you have already shared stock with your friend");
        } else {
            if (req.body.name && req.body.email && req.body.friendName) {
                let obj = new Refer({
                    yourName: req.body.name,
                    yourEmail: req.body.email,
                    friendName: req.body.friendName,
                    friendPhone: req.body.friendPhone,
                    stockName: req.body.stockName,
                })
                let result = await obj.save()
                await sms.sendSms(req.body.friendPhone, result._id)
                response.responseHandlerWithData(res, 200, "SMS sent sucessfully", result);
            } else {
                await sms.sendSms(req.body.friendPhone, req.body.referId)
                response.responseHandlerWithData(res, 200, "SMS sent sucessfully");
            }
        }
    } catch (error) {
        response.log("send sms error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const referDetails = async (req, res) => {
    try {
        let result = await Refer.findOne({ _id: req.params.id })
        response.responseHandlerWithData(res, 200, "Details found sucessfully", result);
    } catch (error) {
        response.log("send sms error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const referList = async (req, res) => {
    try {
        let result = await Refer.find({})
        response.responseHandlerWithData(res, 200, "Details found sucessfully", result);
    } catch (error) {
        response.log("refer list error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const appLink = async (req, res) => {
    try {
        await sms.sendAppLink(req.body.phoneNumber)
        response.responseHandlerWithData(res, 200, "SMS sent sucessfully");
    }
    catch (error) {
        response.log("send sms error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createUser = async (req, res) => {
    try {
        response.log("Request for admin login is===========>", req.body);
        req.checkBody('email', 'Your email address is invalid. Please enter a valid address.').isEmail().notEmpty();
        req.checkBody('password', 'Please enter a valid password').notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            let error = errors[0].msg;
            response.log("Field is missing")
            return response.responseHandlerWithMessage(res, 400, error);
        }

        let jwtToken = jwt.sign({ _id: "12345678" }, config.jwtSecretKey, { expiresIn: '15d' });
        console.log('jwtToken', jwtToken)

        let Obj = new User({
            email: req.body.email,
        })
        let data = await Obj.save()

        let jsonBody = {
            "with": ["1616564927"],
            "name": "Android App Backend"
        };
        let orbisApi = await fetch("https://accounts-api-sandbox.orbisfn.io/api/auth/api-keys/create", {
            method: "post",
            body: jsonBody,
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((json) => console.log('jsonDataError', json));



        response.responseHandlerWithData(res, 200, "User added sucessfully", orbisApi);

    }
    catch (error) {
        response.log("send sms error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

function bcryptCompare(newpwd, existpwd) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(newpwd, existpwd, (err, hash) => {
            if (err) reject(err)
            else resolve(hash)
        });

    })
}

module.exports = {
    adminLogin,
    saveEmail,
    waitList,
    sendEmail,
    sendSMS,
    referDetails,
    referList,
    appLink,
    createUser,
}
