const User = require('../../models/userModel');
const Mobileverification = require('../../models/mobileverificationModel');
const Questionnaires = require('../../models/questionnaireModel');
const Questions = require('../../models/questionsModel');
const Questionnairesportfolios = require('../../models/questionnairesportfoliosModel');
const Portfolio = require('../../models/portfolioModel');
const Model = require('../../models/modelModel');
const Answers = require('../../models/answerModel');
const Plans = require('../../models/planModel');
const Popularstock = require('../../models/popularstockModel');
const Thematic = require('../../models/thematicModel');
const Userthematic = require('../../models/userthematicModel');
const response = require('../../utils/response');
const Joi = require('joi');
const fetch = require('node-fetch');
const config = require('../../config/config');
const orbisRequest = require('../../authHandler/orbisRequest');
const plaidRequest = require('../../authHandler/plaidRequest');
const orbisControllerRequest = require('../../controllers/orbis/orbisController');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
var mongodb = require("mongodb")
var jws = require("jws")
// const { ObjectId } = require('mongodb')



const sendingTwilioMessage = async (req, res) => {
    try {
        const schema = Joi.object({
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
                body: 'Your OTP Is :' + req.otp,
                messagingServiceSid: 'MGa7c6587f0b76ecc55bbc9e12fe0eb372',
                to: req.countryCode + req.mobileNo
            })
            .then(message => console.log('sent otp', message.sid));

        await Mobileverification.deleteMany({ mobileNo: req.mobileNo, countryCode: req.countryCode })
        let Obj = new Mobileverification({
            countryCode: req.countryCode,
            mobileNo: req.mobileNo,
            otp: req.otp
        })

        let userData = await Obj.save();

        // console.log('messageIdmessageIdmessageIdmessageId',messageId)

        return userData;
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const checkUserMobileNo = async (req, res) => {
    try {
        const schema = Joi.object({
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().min(3).max(30).required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkmobileNo = await Mobileverification.findOne({ mobileNo: req.body.mobileNo, countryCode: req.body.countryCode })
        if (checkmobileNo) {
            response.log("userName does not exist");
            return response.responseHandlerWithMessage(res, 401, "This mobileNo is already exist.");
        }

        let sendData = {
            otp: Math.floor(1000 + Math.random() * 9000),
            countryCode: req.body.countryCode,
            mobileNo: req.body.mobileNo
        }

        let sendOtp = await sendingTwilioMessage(sendData);
        console.log('sendOtpsendOtpsendOtp', sendOtp)
        if (sendOtp) {
            return response.responseHandlerWithData(res, 200, "OTP sent on your registered mobile no.", sendOtp);
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

                // let jwtToken = jwt.sign({ "_id": userData._id }, config.jwtSecretKeyApp, { expiresIn: '15d' });
                // let result2 = await User.findByIdAndUpdate({ _id: userData._id }, { $set: { jwtToken: jwtToken } }, { new: true })

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
const getApplicationStatus = async (req, res) => {
    try {
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let getUser = await User.findOne({ _id: req.params.userId })
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }


        let getForm = await orbisRequest.getOrbisApplicationStatus(getUser, req.params.appId);
        console.log('createForm.application_types_id', getForm)

        if (getForm.status) {
            return response.responseHandlerWithData(res, 200, "success", getForm);
        } else {
            return response.responseHandlerWithMessage(res, 402, getForm);
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
            let appId = createApp.application.id;
            await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { applicationId: appId } }, { new: true })

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
        console.log('reqqqqqqqq', req.body)
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

const addQuestion = async (req, res) => {
    resultArr = [];
    let a = await req[0].models.forEach(async function (question, index, arr) {

        let getPortfolio = await Portfolio.findOne({ _id: question.portfolioId });

        let getModels = await Model.findOne({ _id: question.modelId });

        let ObjData = await {
            getPortfolio: "sass",
            getModels: "getModels"
        }
        await resultArr.push(ObjData)
    })
    console.log('resultArrresultArr', a)
    return resultArr;

}

// function addQuestion(data) {
//     // console.log("hiii", data[0].models)
//     resultArr = [];
//     data[0].models.forEach(async function (question, index, arr) {
//         let getPortfolio = await Portfolio.findOne({ _id: question.portfolioId });
//         let getModels = await Model.findOne({ _id: question.modelId });
//         letObj = {
//             getPortfolio: getPortfolio,
//             getModels: getModels 
//         }
//         console.log('letObj', letObj)
//         await resultArr.push(letObj)
//     })
//     console.log("hiii", resultArr)
// }

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


        // let data = await Questionnaires.aggregate([
        //     { $match: { $or: [{ "status": '1' }, { "status": 1 }] } },
        //     {
        //         $lookup: {
        //             from: "portfolios",
        //             localField: "portfolio.oid",
        //             foreignField: "_id",
        //             as: "portfolioDetail"
        //         },
        //     },
        //     {
        //         $project: {
        //             "title": 1,
        //             "description": 1,
        //             "portfolioDetail.name": 1,
        //             "portfolioDetail.riskLevel": 1,
        //             "portfolioDetail.drift": 1,
        //             "portfolioDetail.description": 1,
        //             "portfolioDetail.modelId": 1,
        //             "portfolioDetail.oid": 1,
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'questions',
        //             let: { "questionnairesId": "$_id" },
        //             pipeline: [
        //                 { $match: { $expr: { $eq: ["$$questionnairesId", "$questionnaireId"] } } },
        //                 { $project: { _id: 1, question: 1 } },
        //                 { $sort: { _id: -1 } },
        //                 {
        //                     $lookup: {
        //                         from: 'answers',
        //                         let: { 'qId': '$_id' },
        //                         pipeline: [
        //                             { $match: { $expr: { $eq: ['$$qId', '$questionId'] } } },
        //                         ],
        //                         as: 'answers'
        //                     }
        //                 },
        //                 // { $project: { _id: 1, answer: 1 } },
        //             ],
        //             as: 'questions'
        //         }
        //     }
        // ])

        // let addQuestionVar = await addQuestion(data);


        return response.responseHandlerWithData(res, 200, "Okay", data);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getSuggestedPortfolio = async (req, res) => {
    try {
        let score = Number(req.body.score);
        console.log(req.body.score)
        const data = await Questionnairesportfolios
            .aggregate([
                // { $match: { minScore: { $lt: score } } },
                { $match: { $and: [{ minScore: { $lte: score } }, { maxScore: { $gte: score } }, { questionnaireId: mongodb.ObjectID(req.body.questionnaireId) }] } },

                {
                    $lookup: {
                        from: "models",
                        localField: "modelId",
                        foreignField: "_id",
                        as: "modelDetail"
                    }
                },
                {
                    $lookup: {
                        from: "portfolios",
                        localField: "portfolioId",
                        foreignField: "_id",
                        as: "portfolioDetail"
                    }
                },
                {
                    $project: {
                        "portfolioId": 1,
                        "modelId": 1,
                        "questionnaireId": 1,
                        "minScore": 1,
                        "maxScore": 1,
                        "name": 1,
                        "riskLevel": 1,
                        "drift": 1,
                        "description": 1,
                        "modelDetail.orbisModelId": 1,
                        "modelDetail.modelName": 1,
                        "modelDetail.maximumDeviationAllowance": 1,
                        "modelDetail.models": 1,
                        "portfolioDetail.name": 1,
                        "portfolioDetail.riskLevel": 1,
                        "portfolioDetail.drift": 1,
                        "portfolioDetail.description": 1,
                    }
                },
            ])
        return response.responseHandlerWithData(res, 200, "Okay", data);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getAllSuggestedPortfolio = async (req, res) => {
    try {
        const data = await Questionnairesportfolios
            .aggregate([
                // { $match: { minScore: { $lt: score } } },
                // { $match: { $and: [{ minScore: { $lte: score } }, { maxScore: { $gte: score } }] } },

                {
                    $lookup: {
                        from: "models",
                        localField: "modelId",
                        foreignField: "_id",
                        as: "modelDetail"
                    }
                },
                {
                    $lookup: {
                        from: "portfolios",
                        localField: "portfolioId",
                        foreignField: "_id",
                        as: "portfolioDetail"
                    }
                },
                {
                    $project: {
                        "portfolioId": 1,
                        "modelId": 1,
                        "questionnaireId": 1,
                        "minScore": 1,
                        "maxScore": 1,
                        "name": 1,
                        "riskLevel": 1,
                        "drift": 1,
                        "description": 1,
                        "modelDetail.orbisModelId": 1,
                        "modelDetail.modelName": 1,
                        "modelDetail.maximumDeviationAllowance": 1,
                        "modelDetail.models": 1,
                        "portfolioDetail.name": 1,
                        "portfolioDetail.riskLevel": 1,
                        "portfolioDetail.drift": 1,
                        "portfolioDetail.description": 1,
                    }
                },
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

        // let jwtToken = jwt.sign({ "_id": checkUser._id }, config.jwtSecretKeyApp, { expiresIn: '15d' });
        // let result = await User.findByIdAndUpdate({ _id: checkUser._id }, { $set: { "jwtToken": jwtToken, deviceToken: req.body.deviceToken, deviceType: req.body.deviceType } }, { new: true })

        let getUser = await User.findById({ _id: checkUser._id }).select('interestedAccount accountType status orbisUserId email userName firstName middleName lastName countryCode mobileNo orbisToken createdAt jwtToken')
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
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);




        let checkmobileNo = await Mobileverification.findOne({ mobileNo: req.body.mobileNo, countryCode: req.body.countryCode })
        if (!checkmobileNo) {
            return response.responseHandlerWithMessage(res, 401, "This mobileNo is not exist.");
        }

        let sendData = {
            otp: Math.floor(1000 + Math.random() * 9000),
            countryCode: req.body.countryCode,
            mobileNo: req.body.mobileNo
        }

        let sendOtp = await sendingTwilioMessage(sendData);
        console.log('sendOtpsendOtpsendOtp', sendOtp)
        if (sendOtp) {
            return response.responseHandlerWithData(res, 200, "OTP sent on your registered mobile no.", sendOtp);
        } else {
            return response.responseHandlerWithData(res, 401, "OTP Error");
        }




    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const verifyOtp = async (req, res) => {
    try {
        const schema = Joi.object({
            otp: Joi.string().required(),
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let getUser = await Mobileverification.findOne({ mobileNo: req.body.mobileNo, countryCode: req.body.countryCode }).select('_id mobileNo otp countryCode  createdAt')
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 400, "Mobile is not registered");
        }
        console.log(getUser.otp, '==', req.body.otp);
        if (getUser.otp == req.body.otp) {
            return response.responseHandlerWithMessage(res, 200, "Account Verified");
        } else {
            return response.responseHandlerWithMessage(res, 400, "Invalid OTP");
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
const choosePlans = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
            planId: Joi.required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let portfolioCheck = mongodb.ObjectID.isValid(req.body.planId);
        if (!portfolioCheck) response.responseHandlerWithMessage(res, 203, "Invalid id");

        // let portfolioData = JSON.parse(req.body.portfolio);

        let result = await User.updateOne({ _id: req.body.userId }, { $set: { planId: req.body.planId } }, { new: true })
        if (result) {
            return response.responseHandlerWithData(res, 200, "Plan Saved.", req.body);
        } else {
            return response.responseHandlerWithData(res, 201, "Server Error.", req.body);
        }

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

const getPopularStock = async (req, res) => {
    try {
        // const schema = Joi.object({
        //     userId: Joi.string().required(),
        // })
        // const { error } = await schema.validate(req.body);
        // if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");


        let popularStock = await Popularstock.find({ tickerType: 1 })
        let popularEtf = await Popularstock.find({ tickerType: 2 })
        let popularCrypto = await Popularstock.find({ tickerType: 3 })

        let popularStockArr = {
            "title": "Popular Stock",
            "popularStock": popularStock,
        }
        let popularEtfArr = {
            "title": "Popular Funds",
            "popularStock": popularEtf,
        }
        let popularCryptoArr = {
            "title": "Popular Themes",
            "popularStock": popularCrypto,
        }
        // let returnObj = {
        //     "popularStock": popularStock,
        //     "popularEtf": popularEtf,
        //     "popularCrypto": popularCrypto
        // }
        let returnObj = {
            "allData": [popularStockArr, popularEtfArr, popularCryptoArr]
        }
        return response.responseHandlerWithData(res, 200, "Popolar Stock List", returnObj);
    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createBasket = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
            basket: Joi.required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let basketData = JSON.parse(req.body.basket);

        let result = await User.updateOne({ _id: req.body.userId }, { $set: { userBasket: basketData } }, { new: true })
        if (result) {
            return response.responseHandlerWithData(res, 200, "Basket Created.", req.body);
        } else {
            return response.responseHandlerWithData(res, 201, "Server Error.", req.body);
        }

    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createPortfolio = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
            portfolioId: Joi.required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let portfolioCheck = mongodb.ObjectID.isValid(req.body.portfolioId);
        if (!portfolioCheck) response.responseHandlerWithMessage(res, 203, "Invalid id");

        // let portfolioData = JSON.parse(req.body.portfolio);

        let result = await User.updateOne({ _id: req.body.userId }, { $set: { portfolioId: req.body.portfolioId } }, { new: true })
        if (result) {
            return response.responseHandlerWithData(res, 200, "Portfolio Created.", req.body);
        } else {
            return response.responseHandlerWithData(res, 201, "Server Error.", req.body);
        }

    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getThematicBasket = async (req, res) => {
    try {
        // let result = await Thematic.find({})
        const data = await Thematic
            .aggregate([
                { $match: { $or: [{ "thematicStatus": '1' }, { "thematicStatus": 1 }] } },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1, models: 1 } },

                            // { $project: { _id: 1, answer: 1 } },
                        ],
                        as: 'models'
                    }
                }
            ])

        response.responseHandlerWithData(res, 200, "Thematic List", data);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const createThematicBasket = async (req, res) => {
    try {
        const thematicData = [];
        const schema = Joi.object({
            userId: Joi.string().required(),
            thematicId: Joi.required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        var splitArr = req.body.thematicId.split(",");
        // console.log('mongodb.ObjectID(question)', splitArr);
        await splitArr.forEach(async function (question, index, arr) {
            let getThematic = await Thematic.findById(question)

            let userThemeticObj = new Userthematic({
                userId: req.body.userId,
                modelId: getThematic.modelId,
                thematicId: mongodb.ObjectID(question),
            })
            let data = await userThemeticObj.save();
        });
        // console.log('thematicData', thematicData);

        return response.responseHandlerWithMessage(res, 200, "Thematic Created.");

    } catch (error) {
        response.log("Login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const userDashboard = async (req, res) => {
    try {
        console.log('id', req.params.id)
        console.log('id', req.params.id)
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid UserId");

        let getUser = await User.findById(mongodb.ObjectID(req.params.id)).select('userBasket portfolioId')
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }

        console.log('getUsergetUsergetUsergetUser', getUser)
        const thematicData = await Userthematic
            .aggregate([
                { $match: { userId: mongodb.ObjectID(req.params.id) } },

                {
                    $lookup: {
                        from: 'thematics',
                        let: { "thematicId": "$thematicId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$thematicId"] } } },
                            { $project: { _id: 1, thematicName: 1, thematicImage: 1, thematicDescription: 1, modelId: 1 } },
                            { $sort: { _id: -1 } },
                        ],
                        as: 'thematicDetail'
                    }
                },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1, maximumDeviationAllowance: 1, adjustedFrequency: 1, models: 1 } },
                            { $sort: { _id: -1 } },
                        ],
                        as: 'modelDetail'
                    }
                },
                { $unwind: "$thematicDetail" },
                { $unwind: "$modelDetail" }
            ])



        let getPortfolio = await Portfolio.findById(getUser.portfolioId).select('_id modelId name riskLevel drift description')
        let getModels = await Model.findById(getPortfolio.modelId).select('_id orbisModelId modelName maximumDeviationAllowance adjustedFrequency description models')

        // let orbisModel = []
        let orbisModel = await orbisControllerRequest.getOrbisModels(req);

        const filterResult = [];
        orbisModel.forEach(function (value, key) {
            // console.log('value.id', getModels.orbisModelId)
            if (value.id == getModels.orbisModelId) {
                filterResult.push(value);
            }
        });

        let resultData = {
            userBasket: getUser.userBasket,
            thematicData: thematicData,
            getPortfolio: getPortfolio,
            getModels: getModels,
            orbisModel: filterResult
        }
        response.responseHandlerWithData(res, 200, "Plan Detail", resultData);

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getMyPlans = async (req, res) => {
    try {


        console.log('id', req.params.id)
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid UserId");

        let getUser = await User.findById(mongodb.ObjectID(req.params.id)).select('interestedAccount accountType status orbisUserId email userName firstName middleName lastName countryCode mobileNo orbisToken createdAt jwtToken planId thematic')
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }
        let myPlan = await Plans.findById(mongodb.ObjectID(getUser.planId)).select('name price status duration features description')

        let getAllPlans = await Plans.find({ status: 1 })
        // Themetic
        const thematicData = await Userthematic
            .aggregate([
                { $match: { userId: mongodb.ObjectID(req.params.id) } },

                {
                    $lookup: {
                        from: 'thematics',
                        let: { "thematicId": "$thematicId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$thematicId"] } } },
                            { $project: { _id: 1, thematicName: 1, thematicImage: 1, thematicDescription: 1, modelId: 1 } },
                            { $sort: { _id: -1 } },
                        ],
                        as: 'thematicDetail'
                    }
                },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1, maximumDeviationAllowance: 1, adjustedFrequency: 1, models: 1 } },
                            { $sort: { _id: -1 } },
                        ],
                        as: 'modelDetail'
                    }
                },
                { $unwind: "$thematicDetail" },
                { $unwind: "$modelDetail" }
            ])
        let resultData = {
            currenPlan: myPlan,
            availablePlan: getAllPlans,
            getThematicResult: thematicData
        }

        response.responseHandlerWithData(res, 200, "Plan Detail", resultData);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getMyPortfolio = async (req, res) => {
    try {
        console.log('id', req.params.id)
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid UserId");

        let getUser = await User.findById(mongodb.ObjectID(req.params.id)).select('interestedAccount accountType email userName firstName middleName lastName countryCode mobileNo portfolioId')
        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }

        let getPortfolio = await Portfolio.findById(getUser.portfolioId).select('_id modelId name riskLevel drift description')
        if (!getPortfolio) {
            return response.responseHandlerWithMessage(res, 201, "Portfolio not exist.");
        }

        let getModels = await Model.findById(getPortfolio.modelId).select('_id orbisModelId modelName maximumDeviationAllowance adjustedFrequency description models')

        let orbisModel = await orbisControllerRequest.getOrbisModels(req);

        const filterResult = [];
        orbisModel.forEach(function (value, key) {
            // console.log('value.id', getModels.orbisModelId)
            if (value.id == getModels.orbisModelId) {
                filterResult.push(value);
                // console.log(value)
            }

            // filterResult.push(value);
        });

        let resultData = {
            getUser: getUser,
            getPortfolio: getPortfolio,
            getModels: getModels,
            orbisModel: filterResult
        }

        // let resultData = await Portfolio.aggregate([
        //     {
        //         $match: {
        //             // _id: ObjectId(req.params.id)
        //             _id: mongodb.ObjectID(getUser.portfolioId)
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "models",
        //             localField: "modelId",
        //             foreignField: "_id",
        //             as: "modelDetail"
        //         }
        //     },
        //     {
        //         $project: {
        //             "name": 1,
        //             "riskLevel": 1,
        //             "drift": 1,
        //             "description": 1,
        //             "modelDetail.modelName": 1,
        //             "modelDetail.models": 1,
        //             "modelDetail.maximumDeviationAllowance": 1,
        //             "modelDetail.adjustedFrequency": 1,
        //         }
        //     },
        //     { $unwind: "$modelDetail" }
        // ])

        response.responseHandlerWithData(res, 200, "Portfolio Detail", resultData);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getMyAccountInfo = async (req, res) => {
    try {
        console.log('id', req.params.id)
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid UserId");

        let getUser = await User.findById(mongodb.ObjectID(req.params.id)).select('interestedAccount accountType email userName firstName middleName lastName countryCode mobileNo portfolioId ssn dob address1 address2 zipcode state')

        if (!getUser) {
            return response.responseHandlerWithMessage(res, 201, "User not exist.");
        }

        response.responseHandlerWithData(res, 200, "Portfolio Detail", getUser);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getNewsList = async (req, res) => {
    try {
        let newsList = await orbisControllerRequest.getAllNewsList();
        response.responseHandlerWithData(res, 200, "News List", newsList);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getNewsListBySymbol = async (req, res) => {
    try {
        let newsList = await orbisControllerRequest.getNewsListBySymbol(req.params.symbol);
        response.responseHandlerWithData(res, 200, "News List", newsList);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const tickerDetail = async (req, res) => {
    try {
        const schema = Joi.object({
            ticker: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let newsList = await orbisControllerRequest.getOrbisTicker(req);
        response.responseHandlerWithData(res, 200, "Ticker List", newsList);

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getTopStockList = async (req, res) => {
    try {
        let resultData = [];
        let TopStockList = await orbisControllerRequest.getOrbisTopStockList(req);

        for (i = 0; i < TopStockList.length; i++) {
            let ticketData = await orbisControllerRequest.getOrbisStockImage(TopStockList[i].quote.symbol);
            if (ticketData.logo_square) {
                console.log('ticketData', ticketData)
                TopStockList[i]['ticker_image'] = ticketData.logo_square
            } else {
                console.log('ticketData', ticketData)
                TopStockList[i]['ticker_image'] = ""
            }
            resultData.push(TopStockList[i])
        }
        response.responseHandlerWithData(res, 200, "Ticker List", resultData);

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getStockImage = async (req, res) => {
    try {

        let newsList = await orbisControllerRequest.getOrbisStockImage(req);
        response.responseHandlerWithData(res, 200, "Ticker List", newsList);

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const updateAccountInfo = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            firstName: Joi.string().min(3).max(30).required(),
            middleName: Joi.string().allow(''),
            lastName: Joi.string().min(3).max(30).required(),
            countryCode: Joi.string().required(),
            mobileNo: Joi.string().min(3).max(30).required(),
            ssn: Joi.string().required(),
            dob: Joi.string().required(),
            address1: Joi.string().required(),
            address2: Joi.string().required(),
            zipcode: Joi.string().required(),
            state: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let checkUser = await User.findById(req.body.userId)
        if (!checkUser) {
            return response.responseHandlerWithMessage(res, 401, "This User is not exist.");
        }


        let userObj = {
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            countryCode: req.body.countryCode,
            mobileNo: req.body.mobileNo,
            ssn: req.body.ssn,
            dob: req.body.dob,
            address1: req.body.address1,
            address2: req.body.address2,
            zipcode: req.body.zipcode,
            state: req.body.state,
        }
        var savedUser = await User.findByIdAndUpdate({ _id: req.body.userId }, userObj, { new: true });
        if (savedUser) {
            return response.responseHandlerWithMessage(res, 200, "User Updated Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }


    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const upgradePlan = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            planId: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid userId");

        let checkUser = await User.findById(req.body.userId)
        if (!checkUser) {
            return response.responseHandlerWithMessage(res, 401, "This User is not exist.");
        }

        let checkPlanIdIsTrue = mongodb.ObjectID.isValid(req.body.planId);
        if (!checkPlanIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid PlanId");

        let checkPlan = await Plans.findById(req.body.planId)
        if (!checkPlan) {
            return response.responseHandlerWithMessage(res, 401, "This Plan is not exist.");
        }

        let userObj = {
            planId: req.body.planId,
        }
        var savedUser = await User.findByIdAndUpdate({ _id: req.body.userId }, userObj, { new: true });
        if (savedUser) {
            return response.responseHandlerWithMessage(res, 200, "Plan Updraded Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }


    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const cancelPlan = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            planId: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid userId");

        let checkUser = await User.findById(req.body.userId)
        if (!checkUser) {
            return response.responseHandlerWithMessage(res, 401, "This User is not exist.");
        }

        var savedUser = await User.findByIdAndUpdate(req.body.userId, { $unset: { "planId": 1 } });
        if (savedUser) {
            return response.responseHandlerWithMessage(res, 200, "Plan Canceled Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }


    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const cancelBasket = async (req, res) => {
    try {

        const schema = Joi.object({
            userId: Joi.string().required(),
            basketId: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let checkIdIsTrue = mongodb.ObjectID.isValid(req.body.userId);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid userId");

        let checkUser = await User.findById(req.body.userId)
        if (!checkUser) {
            return response.responseHandlerWithMessage(res, 401, "This User is not exist.");
        }

        let checkthematicIdIsTrue = mongodb.ObjectID.isValid(req.body.basketId);
        if (!checkthematicIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid basketId");

        var savedUser = await Userthematic.findOneAndDelete({ _id: req.body.basketId });
        if (savedUser) {
            return response.responseHandlerWithMessage(res, 200, "Basket Canceled Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }


    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const stockPlacement = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
            ticker: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let newsList = await orbisControllerRequest.orbisStockPlacement(req);
        response.responseHandlerWithData(res, 200, "Ticker List", newsList);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const profileMarkAsUpdate = async (req, res) => {
    try {
        const schema = Joi.object({
            userId: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await User.findByIdAndUpdate({ _id: req.body.userId }, { $set: { profileUpdated: 1 } }, { new: true })

        response.responseHandlerWithMessage(res, 200, "Okay");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const searchTicker = async (req, res) => {
    try {
        const schema = Joi.object({
            ticker: Joi.string().required(),
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let getOrbisTicker = await orbisControllerRequest.getOrbisTicker(req);
        let ticketImage = await orbisControllerRequest.getOrbisStockImage(req.body.ticker);
        console.log('getOrbisTicker', getOrbisTicker)
        let tickerData = {
            tickerDetail: getOrbisTicker,
            tickerImage: ticketImage.logo_square
        }
        response.responseHandlerWithData(res, 200, "Ticker Detail", tickerData);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const getHistoricalData = async (req, res) => {
    try {
        const schema = Joi.object({
            ticker: Joi.string().required(),
            startDate: Joi.string().required(),
            endDate: Joi.string().required()
        })
        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let historicaldata = await orbisControllerRequest.getOrbisHistoricalData(req.body);
        response.responseHandlerWithData(res, 200, "Historical Data", historicaldata);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

module.exports = {
    checkUserEmail,
    checkUserMobileNo,
    createUser,
    getApplicationForm,
    getApplicationStatus,
    createApplication,
    giveMultipleAnswer,
    giveSingleAnswer,
    applicationSubmit,
    getQuestionnaire,
    getSuggestedPortfolio,
    getAllSuggestedPortfolio,
    getStateList,
    getCountryList,
    login,
    resetPassword,
    createOtp,
    verifyOtp,
    changePassword,
    getPlans,
    choosePlans,
    sendingTwilioMessage,
    createPlaidToken,
    getPopularStock,
    createBasket,
    createPortfolio,
    getThematicBasket,
    createThematicBasket,
    getAccessToken,
    createJws,
    userDashboard,
    getMyPlans,
    getMyPortfolio,
    getMyAccountInfo,
    getNewsList,
    getNewsListBySymbol,
    tickerDetail,
    updateAccountInfo,
    getTopStockList,
    getStockImage,
    upgradePlan,
    cancelPlan,
    cancelBasket,
    stockPlacement,
    profileMarkAsUpdate,
    searchTicker,
    getHistoricalData
}
