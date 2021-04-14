const jwt = require('jsonwebtoken');
const response = require("../utils/response");
const User = require('../models/userModel')
const config = require('../config/config');
const Admin = require('../models/adminModel')

module.exports = {

    //====================================Admin Auth Function==============================//

    adminAuth: async (req, res, next) => {
        try {
            response.log("Admin Token is==========>", req.headers.authorization)
            if (!req.headers.authorization) {
                response.log("admin Token is missing")
                return response.responseHandlerWithMessage(res, 500, "Something went wrong");
            }
            jwt.verify(req.headers.authorization, config.jwtSecretKey, async (error, result) => {
                if (error) {
                    response.log("Invalid Token1")
                    return response.responseHandlerWithMessage(res, 500, "Invalid Token");
                }
                let checkAdmin = await Admin.findOne({ _id: result._id })
                if (!checkAdmin) {
                    response.log("Invalid Token2")
                    return response.responseHandlerWithMessage(res, 500, "Invalid Token");
                }
                req.user = checkAdmin
                // response.log("Request is==========>", req.user)
                next();
            })
        } catch (error) {
            response.log("Admin Error is============>", error)
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    },


    //====================================App Auth Function================================//

    appAuth: async (req, res, next) => {

        try {
            response.log("Token is==========>", req.headers.authorization)
            if (!req.headers.authorization) {
                response.log("Token is missing")
                return response.responseHandlerWithMessage(res, 401, "Something went wrong");
            }

            jwt.verify(req.headers.authorization, config.jwtSecretKey, async (error, result) => {
                if (error) {
                    response.log("Invalid Token1")
                    return response.responseHandlerWithMessage(res, 401, "Invalid Token");
                }

                console.log({ result })
                let query = { $and: [{ _id: result._id }, { jwtToken: req.headers.authorization }] }
                return response.responseHandlerWithMessage(res, result, "Something went wrong");
                let checkUser = await User.findOne(query)
                if (!checkUser) {
                    response.log("Invalid Token2")
                    return response.responseHandlerWithMessage(res, 401, "Invalid Token");
                }
                if (checkUser.status == 'Inactive') {
                    response.log("You have blocked by administrator")
                    return response.responseHandlerWithMessage(res, 423, "Your account have been disabled by administrator due to any suspicious activity");
                }
                req.user = checkUser
                response.log("Request is==========>", req.user)
                next();
            })
        } catch (error) {
            response.log("Error is============>", error)
            return response.responseHandlerWithMessage(res, 500, "Internal server error");
        }
    }
}