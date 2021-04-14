const User = require('../../models/userModel');
const Questionnaires = require('../../models/questionnaireModel');
const Questions = require('../../models/questionsModel');
const Answers = require('../../models/answerModel');
const Plans = require('../../models/planModel');
const response = require('../../utils/response');
const Joi = require('joi');
const fetch = require('node-fetch');
const config = require('../../config/config');
const orbisRequest = require('../../authHandler/orbisRequest');
const plaidRequest = require('../../authHandler/plaidRequest');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
var mongodb = require("mongodb")
var jws = require("jws")


const sendingTwilioMessage = async (req, res) => {
    try {
        const schema = Joi.object({
            otp: Joi.string().required(),
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);


        const accountSid = "AC7b38d9de5d6a6b554e53c60fa2072719";
        const authToken = "b724c3690be5b397be759d1291542bcd";
        const client = require('twilio')(accountSid, authToken);

        const messageId = await client.messages
            .create({
                body: 'Your OTP Is :' + req.body.otp,
                messagingServiceSid: 'MGa7c6587f0b76ecc55bbc9e12fe0eb372',
                to: req.body.countryCode + req.body.mobileNo
            })
            .then(message => console.log('sent otp', message.sid));

        // console.log('messageIdmessageIdmessageIdmessageId',messageId)

        return true;
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const checkUserMobileNo = async (req, res) => {
    try {
        const schema = Joi.object({
            otp: Joi.string().required(),
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().min(3).max(30).required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkmobileNo = await User.findOne({ mobileNo: req.body.mobileNo, countryCode: req.body.countryCode })
        if (checkmobileNo) {
            response.log("userName does not exist");
            return response.responseHandlerWithMessage(res, 401, "This mobileNo is already exist.");
        }

        let sendOtp = await sendingTwilioMessage(req);
        console.log('sendOtpsendOtpsendOtp', sendOtp)
        if (sendOtp) {
            return response.responseHandlerWithMessage(res, 200, "OTP sent on your registered mobile no.");
        } else {
            return response.responseHandlerWithData(res, 401, "OTP Error");
        }
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const checkUserEmail = async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
            userName: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkUser = await User.findOne({ email: req.body.email })
        if (checkUser) {
            response.log("User does not exist");
            return response.responseHandlerWithMessage(res, 401, "This Email is already exist.");
        }

        let checkUserName = await User.findOne({ userName: req.body.userName })
        if (checkUserName) {
            response.log("userName does not exist");
            return response.responseHandlerWithMessage(res, 401, "This userName is already exist.");
        }
        return response.responseHandlerWithMessage(res, 200, "Okay");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createUser = async (req, res) => {
    try {
        let generateJWTData = await orbisRequest.generateJWT();
        if (generateJWTData.status) {
            let generateJWT = generateJWTData.login.token.access_token;

            const schema = Joi.object({
                email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
                userName: Joi.string().required(),
                firstName: Joi.string().min(3).max(30).required(),
                middleName: Joi.string().allow(''),
                lastName: Joi.string().min(3).max(30).required(),
                countryCode: Joi.string().required(),
                mobileNo: Joi.string().min(3).max(30).required(),
                password: Joi.string().required(),
                interestedAccount: Joi.string().required(),
                accountType: Joi.string().required(),
                deviceType: Joi.string().required(),
                deviceId: Joi.string().required(),
                deviceToken: Joi.string().required(),
            })

            const { error } = await schema.validate(req.body);
            if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

            let checkUser = await User.findOne({ email: req.body.email })
            if (checkUser) {
                return response.responseHandlerWithMessage(res, 401, "This Email is already exist.");
            }

            let checkUserName = await User.findOne({ userName: req.body.userName })
            if (checkUserName) {
                response.log("userName does not exist");
                return response.responseHandlerWithMessage(res, 401, "This userName is already exist.");
            }

            let checkmobileNo = await User.findOne({ mobileNo: req.body.mobileNo, countryCode: req.body.countryCode })
            if (checkmobileNo) {
                response.log("userName does not exist");
                return response.responseHandlerWithMessage(res, 401, "This mobileNo is already exist.");
            }
            req.body.email = (req.body.email).toLowerCase()
            let password = await bcrypt.hash(req.body.password, saltRounds);
            let Obj = new User({
                email: req.body.email,
                userName: req.body.userName,
                firstName: req.body.firstName,
                middleName: req.body.middleName,
                lastName: req.body.lastName,
                password: password,
                countryCode: req.body.countryCode,
                mobileNo: req.body.mobileNo,
                interestedAccount: req.body.interestedAccount,
                accountType: req.body.accountType,
                deviceType: req.body.deviceType,
                deviceId: req.body.deviceId,
                deviceToken: req.body.deviceToken,
                timezone: req.body.timezone,
                orbisToken: generateJWT
            })
            // return response.responseHandlerWithData(res, 401, "Responce Data", Obj);
            let userData = await Obj.save();
            req.body.orbisToken = generateJWT;
            let registerUser = await orbisRequest.registerUser(req.body);
            // console.log('registerUserregisterUser', registerUser)
            // console.log('registerUserregisterUser.status', registerUser.status)
            if (registerUser.status) {
                let orbisUserId = registerUser.user.id;
                let result = await User.updateOne({ email: req.body.email }, { $set: { orbisUserId: orbisUserId } }, { new: true })
                return response.responseHandlerWithData(res, 200, "User Added Successfully", userData);
            } else {
                await User.deleteOne({ email: req.body.email.toLowerCase() });
                return response.responseHandlerWithMessage(res, 401, registerUser.messages);
            }
        } else {
            return response.responseHandlerWithMessage(res, 401, generateJWT.messages);
        }
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getApplicationForm = async (req, res) => {
    try {
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.params.id })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }


        let createForm = await orbisRequest.createForm(getUser);
        console.log('createForm.application_types_id', createForm)
        if (createForm.status) {
            getUser.application_types_id = createForm.application_types[0].id;

            let getForm = await orbisRequest.getForm(getUser);
            // console.log('getFormgetFormgetForm', getForm)
            if (getForm.status) {
                return response.responseHandlerWithData(res, 200, "success", getForm);
            } else {
                return response.responseHandlerWithMessage(res, 402, getForm.message);
            }
        } else {
            return response.responseHandlerWithMessage(res, 401, createForm.http_status_message);
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}


const createApplication = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);


        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.body.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }


        let createApp = await orbisRequest.createApplication(getUser);
        if (createApp.status) {
            return response.responseHandlerWithData(res, 200, "success", createApp);
        } else {
            return response.responseHandlerWithMessage(res, 401, createForm.message);
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const giveMultipleAnswer = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            application_id: Joi.string().required(),
            answers: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.body.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }


        let requestData = {
            application_id: req.body.application_id,
            answers: JSON.parse(req.body.answers),
            userId: req.body.userId,
            orbisUserId: getUser.orbisUserId,
            orbisToken: getUser.orbisToken
        }
        let submitAnswer = await orbisRequest.giveMultipleAnswer(requestData);
        if (submitAnswer.status) {
            return response.responseHandlerWithData(res, 200, "success", submitAnswer);
        } else {
            return response.responseHandlerWithMessage(res, 401, submitAnswer.messages);
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const giveSingleAnswer = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            application_id: Joi.string().required(),
            question_id: Joi.string().required(),
            answers: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.body.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }


        let requestData = {
            application_id: req.body.application_id,
            question_id: req.body.question_id,
            answers: req.body.answers,
            userId: req.body.userId,
            orbisUserId: getUser.orbisUserId,
            orbisToken: getUser.orbisToken
        }
        let submitAnswer = await orbisRequest.giveSingleAnswer(requestData);
        if (submitAnswer.status) {
            return response.responseHandlerWithData(res, 200, "success", submitAnswer);
        } else {
            return response.responseHandlerWithMessage(res, 401, submitAnswer.messages);
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const applicationSubmit = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            application_id: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.body.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }

        let requestData = {
            application_id: req.body.application_id,
            userId: req.body.userId,
            orbisUserId: getUser.orbisUserId,
            orbisToken: getUser.orbisToken
        }
        let submitApp = await orbisRequest.applicationSubmit(requestData);
        if (submitApp.status) {
            return response.responseHandlerWithData(res, 200, "success", submitApp);
        } else {
            return response.responseHandlerWithMessage(res, 401, submitApp.messages);
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getQuestionnaireOld = async (req, res) => {
    try {
        let getAllQuestion = await Questionnaires.aggregate([
            { $match: { status: 1 } },
            {
                $lookup: {
                    from: 'questions',
                    localField: '_id',
                    foreignField: 'questionnaireId',
                    as: 'questionsDetails'

                },
            },
            {
                $unwind: "$questionsDetails"
            },
            {
                $lookup: {
                    from: "answers",
                    localField: "questionsDetails._id",
                    foreignField: "questionId",
                    as: "questionsDetails.answer_data"
                }
            },
            // {
            //     $unwind: "$questionsDetails.answer_data"
            // }
        ])

        return response.responseHandlerWithData(res, 200, "Get Questionnaires", getAllQuestion);


    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getQuestionnaireUpdated = async (req, res) => {
    try {
        let getQuestionnaires = await Questionnaires.findOne({ status: 1 });
        let resultDemo4 = await Questions.aggregate([
            { $match: { status: 1, questionnaireId: getQuestionnaires._id } },
            {
                $lookup: {
                    from: 'answers',
                    localField: '_id',
                    foreignField: 'questionId',
                    as: 'answersDetails'
                },
            }
        ])
        return response.responseHandlerWithData(res, 200, "Osskay", resultDemo4);


    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}



const getQuestionnaire = async (req, res) => {
    try {
        const data = await Questionnaires
            .aggregate([
                { $match: { $or: [{ "status": '1' }, { "status": 1 }] } },

                {
                    $lookup: {
                        from: 'questions',
                        let: { "questionnairesId": "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$$questionnairesId", "$questionnaireId"] } } },
                            { $project: { _id: 1, question: 1 } },
                            { $sort: { _id: -1 } },
                            {
                                $lookup: {
                                    from: 'answers',
                                    let: { 'qId': '$_id' },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ['$$qId', '$questionId'] } } },
                                    ],
                                    as: 'answers'
                                }
                            },
                            // { $project: { _id: 1, answer: 1 } },
                        ],
                        as: 'questions'
                    }
                }
            ])

        return response.responseHandlerWithData(res, 200, "Okay", data);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const login = async (req, res) => {
    try {
        let generateJWTData = await orbisRequest.generateJWT();

        const schema = Joi.object({
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
            password: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);



        let checkUser = await User.findOne({ email: req.body.email })
        if (!checkUser) {
            response.log("Invalid credentials");
            return response.responseHandlerWithMessage(res, 401, "Invalid credentials");
        }
        if (checkUser.status == '0' || checkUser.status == 0) {
            return response.responseHandlerWithMessage(res, 401, "Please verify your account.");
        }
        var passVerify = await bcrypt.compareSync(req.body.password, checkUser.password);
        if (!passVerify) {
            response.log("Invalid credentials");
            return response.responseHandlerWithMessage(res, 401, "Invalid credentials");
        }
        req.body.password = checkUser.password
        var query = { $and: [{ _id: checkUser._id }, { password: req.body.password }] }
        let checkPassword = await User.findOne(query)
        if (!checkPassword) {
            response.log("Invalid credentials");
            return response.responseHandlerWithMessage(res, 400, "Invalid credentials");
        }

        if (generateJWTData.status) {
            let generateJWT = generateJWTData.login.token.access_token;
            await User.findByIdAndUpdate({ _id: checkUser._id }, { $set: { orbisToken: generateJWT } }, { new: true })
        }

        let getUser = await User.findById({ _id: checkUser._id }).select('interestedAccount accountType status orbisUserId email userName firstName middleName lastName countryCode mobileNo orbisToken createdAt')
        return response.responseHandlerWithData(res, 200, "You have successfully logged in", getUser);

    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const resetPassword = async (req, res) => {
    try {
        const schema = Joi.object({
            password: Joi.string().required(),
            userId: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let checkUser = await User.findOne({ _id: req.body.userId })
        if (!checkUser) {
            response.log("Invalid User Id");
            return response.responseHandlerWithMessage(res, 501, "Invalid User");
        }

        if (checkUser.status == '0' || checkUser.status == 0) {
            return response.responseHandlerWithMessage(res, 401, "Please verify your account.");
        }

        req.body.password = await bcrypt.hashSync(req.body.password, saltRounds);
        await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { password: req.body.password } }, { new: true })
        response.log("Password reset successfully")
        return response.responseHandlerWithMessage(res, 200, "Password reset successfully");
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const changePassword = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let checkUser = await User.findOne({ _id: req.body.userId })
        if (!checkUser) {
            response.log("Invalid User Id");
            return response.responseHandlerWithMessage(res, 501, "Invalid User");
        }

        var passVerify = await bcrypt.compareSync(req.body.oldPassword, checkUser.password);
        if (!passVerify) {
            response.log("Invalid Old Password");
            return response.responseHandlerWithMessage(res, 401, "Invalid Old Password");
        }

        req.body.password = await bcrypt.hashSync(req.body.newPassword, saltRounds);
        await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { password: req.body.password } }, { new: true })

        return response.responseHandlerWithMessage(res, 200, "Password changed successfully");

    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createOtp = async (req, res) => {
    try {
        const schema = Joi.object({
            otp: Joi.string().required(),
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let getUser = await User.findOne({ mobileNo: req.body.mobileNo, countryCode: req.body.countryCode }).select('_id mobileNo status countryCode  createdAt')
        if (getUser) {
            let sendOtp = await sendingTwilioMessage(req);
            return response.responseHandlerWithData(res, 200, "OTP sent on your registered mobile no.", getUser);
        } else {
            return response.responseHandlerWithMessage(res, 400, "This mobile is not registered.");
        }
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getPlans = async (req, res) => {
    try {
        let getAllPlans = await Plans.find({ status: 1 })
        return response.responseHandlerWithData(res, 200, "Plan List.", getAllPlans);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}


const createPlaidToken = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);


        let generateJWTData = await plaidRequest.getTransaction(req);
        return response.responseHandlerWithData(res, 500, "Token created", generateJWTData);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}


const getAccessToken = async (req, res) => {
    try {
        let generateJWTData = await plaidRequest.getPlaidAccessToken(req);
        return response.responseHandlerWithData(res, 500, "Token created", generateJWTData);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createJws = async (req, res) => {
    try {
        const signature = await jws.sign({
            header: { alg: 'HS256' },
            payload: {
                group: "uat",
                entity: "mudaniuat",
                iss: "mudaniapp",
                jti: "eee07215-602e-4a8a-82da-c83b98da7757",
                iat: "1618249743",
                exp: "1618249780",
            },
            secret: 'Zq4t7w!z%C*F-JaNdRgUkXp2r5u8x/A?',
        });
        return response.responseHandlerWithData(res, 500, "Token created", signature);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getStateList = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.body.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let getStateList = await orbisRequest.getStateList(getUser);
        return response.responseHandlerWithData(res, 200, "State List", getStateList);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getCountryList = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.body.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let getStateList = await orbisRequest.getCountryList(getUser);
        return response.responseHandlerWithData(res, 200, "Country List", getStateList);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
module.exports = {
    checkUserEmail,
    checkUserMobileNo,
    createUser,
    getApplicationForm,
    createApplication,
    giveMultipleAnswer,
    giveSingleAnswer,
    applicationSubmit,
    getQuestionnaire,
    getStateList,
    getCountryList,
    login,
    resetPassword,
    createOtp,
    changePassword,
    getPlans,
    sendingTwilioMessage,
    createPlaidToken,
    getAccessToken,
    createJws
}
