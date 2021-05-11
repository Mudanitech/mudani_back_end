const Questionnaire = require('../models/questionnaireModel');
const Questions = require('../models/questionsModel');
const Answer = require('../models/answerModel');
const QuestionnairePortfolio = require('../models/questionnairesportfoliosModel');
const Popularstock = require('../models/popularstockModel');
const Portfolie = require('../models/portfolioModel');
const Model = require('../models/modelModel');
const response = require('../utils/response');
const fileupload = require('../utils/fileupload');
const Joi = require('joi');
var mongodb = require("mongodb")


const addQuestion = async (req, res) => {
    //console.log('req.questionsreq.questionsreq.questions', req.questions)
    let reqData = (req.questions);
    let saveQuestionnaireId = req.saveQuestionnaireId;
    reqData.forEach(async function (question, index, arr) {
        let questionObj = new Questions({
            questionnaireId: saveQuestionnaireId,
            question: question.question,
            status: 1,
            sort: index
        });
        let saveQuestion = await questionObj.save();
        if (saveQuestion) {
            let questionId = saveQuestion._id;
            // console.log('question.answer', question.answers)
            question.answers.forEach(async function (ans, i2, arr2) {
                let answerObj = new Answer({
                    questionnaireId: saveQuestionnaireId,
                    questionId: questionId,
                    answer: ans.answer,
                    value: ans.value,
                    status: 1
                });
                // console.log('reqDatareqDatareqData', answerObj)
                await answerObj.save();
            })
        }
    })
    return true;
}

const updateQuestion = async (req, res) => {
    //console.log('req.questionsreq.questionsreq.questions', req.questions)
    let reqData = (req.questions);
    let saveQuestionnaireId = req.saveQuestionnaireId;
    await Questions.deleteMany({ questionnaireId: saveQuestionnaireId });
    await Answer.deleteMany({ questionnaireId: saveQuestionnaireId });
    reqData.forEach(async function (question, index, arr) {
        let questionObj = new Questions({
            questionnaireId: saveQuestionnaireId,
            question: question.question,
            status: 1,
            sort: index
        });
        let saveQuestion = await questionObj.save();
        if (saveQuestion) {
            let questionId = saveQuestion._id;
            // console.log('question.answer', question.answers)
            question.answers.forEach(async function (ans, i2, arr2) {
                let answerObj = new Answer({
                    questionnaireId: saveQuestionnaireId,
                    questionId: questionId,
                    answer: ans.answer,
                    value: ans.value,
                    status: 1
                });
                // console.log('reqDatareqDatareqData', answerObj)
                await answerObj.save();
            })
        }
    })
    return true;
}
const updateQuestion2222 = async (req, res) => {
    //console.log('req.questionsreq.questionsreq.questions', req.questions)
    let reqData = (req.questions);
    let saveQuestionnaireId = req.saveQuestionnaireId;
    reqData.forEach(async function (question, index, arr) {

        if (question.question_id) {
            var saveQuestion = await Questions.findByIdAndUpdate({ _id: question.question_id }, { "question": question.question, sort: index }, { new: true });
            var questionId = question.question_id;
        } else {
            let questionObj = new Questions({
                questionnaireId: saveQuestionnaireId,
                question: question.question,
                status: 1,
                sort: index
            });
            var saveQuestion = await questionObj.save();
            var questionId = saveQuestion._id;
        }

        if (saveQuestion) {

            // console.log('question.answer', question.answers)
            question.answers.forEach(async function (ans, i2, arr2) {
                if (ans.answer_id) {
                    await Answer.findByIdAndUpdate({ _id: ans.answer_id }, { "answer": ans.answer, "value": ans.value }, { new: true });
                } else {
                    let answerObj = new Answer({
                        questionnaireId: saveQuestionnaireId,
                        questionId: questionId,
                        answer: ans.answer,
                        value: ans.value,
                        status: 1
                    });
                    console.log('wwwwwwwwwwwwwwwwwwwwwwwww', answerObj)
                    await answerObj.save();
                }
            })
        }
    })
    return true;
}


const addQuestionnaire = async (req, res) => {
    try {
        const schema = Joi.object({
            title: Joi.string().min(3).max(30).required(),
            description: Joi.string().min(30).required(),
            questions: Joi.required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let questionnaireObj = new Questionnaire({
            title: req.body.title,
            description: req.body.description,
        })
        let addQuestionnaire = await questionnaireObj.save();
        if (addQuestionnaire) {
            let questionObj = {
                saveQuestionnaireId: addQuestionnaire._id,
                questions: req.body.questions
            }
            //console.log('schemaschemaschemaschema', questionObj)
            let addQuestionVar = await addQuestion(questionObj);
        }
        return response.responseHandlerWithData(res, 200, "Questionnaire Added Successfully", addQuestionnaire);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const editQuestionnaire = async (req, res) => {
    try {
        const schema = Joi.object({
            questionnaire_id: Joi.string().min(3).max(30).required(),
            title: Joi.string().min(3).max(30).required(),
            description: Joi.string().min(30).required(),
            questions: Joi.required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Questionnaire.findByIdAndUpdate({ _id: req.body.questionnaire_id }, { "title": req.body.title, description: req.body.description }, { new: true });
        if (result) {
            let questionObj = {
                saveQuestionnaireId: req.body.questionnaire_id,
                questions: req.body.questions
            }
            //console.log('schemaschemaschemaschema', questionObj)
            let addQuestionVar = await updateQuestion(questionObj);
        }
        return response.responseHandlerWithMessage(res, 200, "Questionnaire Updated Successfully");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const assignedPortfolio = async (req, res) => {
    try {
        const schema = Joi.object({
            questionnaire_id: Joi.string().min(3).max(30).required(),
            portfolioId: Joi.string().required(),
            minScore: Joi.required(),
            maxScore: Joi.required()
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Questionnaire.findById(req.body.questionnaire_id);

        if (!result) {
            return response.responseHandlerWithMessage(res, 201, "Portfolie Not Added");
        }

        let getPortfolio = await Portfolie.findById(req.body.portfolioId);
        if (!getPortfolio.modelId) {
            return response.responseHandlerWithMessage(res, 201, "Model Not Found");
        }

        let QuestionnairePortfolioObj = new QuestionnairePortfolio({
            portfolioId: req.body.portfolioId,
            modelId: getPortfolio.modelId,
            questionnaireId: req.body.questionnaire_id,
            minScore: req.body.minScore,
            maxScore: req.body.maxScore,
        })
        let addQuestionnaire = await QuestionnairePortfolioObj.save();
        if (addQuestionnaire) {
            return response.responseHandlerWithMessage(res, 200, "Portfolie Added Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Portfolie Not Added");
        }
        //     let getModels = await Model.findById(getPortfolio.modelId);
        //     let requestData = {
        //         uniqueKey: Date.now(),
        //         modelId: getPortfolio.modelId,
        //         portfolioId: getPortfolio._id,
        //         name: getPortfolio.name,
        //         riskLevel: getPortfolio.riskLevel,
        //         drift: getPortfolio.drift,
        //         description: getPortfolio.description,
        //         score: req.body.score,
        //         holding: getModels.models
        //     }
        //     result.portfolio.push(requestData);
        //     result.save();

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}
const deletePortfolio = async (req, res) => {
    try {
        const schema = Joi.object({
            questionnaire_id: Joi.string().min(3).max(30).required(),
            quesPortfolioId: Joi.required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Questionnaire.findById(req.body.questionnaire_id);

        if (!result) {
            return response.responseHandlerWithMessage(res, 201, "Portfolie Not Found");
        }

        await QuestionnairePortfolio.findByIdAndDelete(req.body.quesPortfolioId);

        return response.responseHandlerWithMessage(res, 200, "Portfolie Deleted Successfully");
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const questionnaireList = async (req, res) => {
    try {
        let result = await Questionnaire.find({ status: 1 })
        response.responseHandlerWithData(res, 200, "Questionnaire List", result);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const deleteQuestionnaire = async (req, res) => {
    try {
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        // console.log('req.params.id', req.params.id)
        let result = await Questionnaire.updateOne({ _id: req.params.id }, { $set: { status: 99 } }, { new: true })
        response.responseHandlerWithData(res, 200, "Questionnaire deleted", result);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getQuestionaireDetail = async (req, res) => {
    try {
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        console.log('ss', req.params.id)
        const data = await Questionnaire
            .aggregate([
                // { $match: { $or: [{ "status": '1' }, { "status": 1 }] } },
                { $match: { _id: mongodb.ObjectID(req.params.id), $or: [{ "status": '1' }, { "status": 1 }] } },

                {
                    $lookup: {
                        from: 'questions',
                        let: { "questionnairesId": "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$$questionnairesId", "$questionnaireId"] } } },
                            { $project: { _id: 1, question: 1 } },
                            { $sort: { sort: 1 } },
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

const getQuestionairePortfolio = async (req, res) => {
    try {
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        let score = Number(req.body.score);
        console.log(req.body.score)
        const data = await QuestionnairePortfolio
            .aggregate([
                // { $match: { minScore: { $lt: score } } },
                { $match: { $and: [{ questionnaireId: mongodb.ObjectID(req.params.id) }] } },
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

const addTicker = async (req, res) => {
    try {
        const schema = Joi.object({
            tickerType: Joi.required(),
            tickerImage: Joi.string().required(),
            symbol: Joi.string().required(),
            companyName: Joi.string().required(),
            isin: Joi.string().required(),
            cusip: Joi.string().required(),
            country: Joi.string().required(),
            mic: Joi.string().required(),
            currency: Joi.string().required(),
            source: Joi.string().required(),
            identType: Joi.string().required(),
            exchange: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let result = await Popularstock.findOne({ symbol: req.body.symbol });
        if (result) {
            return response.responseHandlerWithMessage(res, 201, "Ticker Already Added.");
        }
        let PopularstockObj = new Popularstock({
            tickerType: req.body.tickerType,
            tickerImage: req.body.tickerImage,
            symbol: req.body.symbol,
            companyName: req.body.companyName,
            isin: req.body.isin,
            cusip: req.body.cusip,
            country: req.body.country,
            mic: req.body.mic,
            currency: req.body.currency,
            source: req.body.source,
            identType: req.body.identType,
            exchange: req.body.exchange,
        })
        let saveData = await PopularstockObj.save();
        if (saveData) {
            return response.responseHandlerWithData(res, 200, "Ticker Added Successfully.", saveData);
        } else {
            return response.responseHandlerWithMessage(res, 200, "OOPS Some Error Found.");
        }

    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const getTickerList = async (req, res) => {
    try {
        let result = await Popularstock.find();
        return response.responseHandlerWithData(res, 200, "Ticker List", result);
    } catch (error) {
        response.log("admin login error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const uploadImage = async function (req, res) {

    // console.log('req.files.image', req.files.image);

    const image = await fileupload.imageUpload(req.files.image);
    //console.log('image', image)
    return response.responseHandlerWithData(res, 200, "Image Uploaded", image);
}




module.exports = {
    addQuestion,
    addQuestionnaire,
    questionnaireList,
    deleteQuestionnaire,
    getQuestionaireDetail,
    getQuestionairePortfolio,
    editQuestionnaire,
    assignedPortfolio,
    deletePortfolio,
    addTicker,
    getTickerList,
    uploadImage,
}
