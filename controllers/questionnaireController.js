const Questionnaire = require('../models/questionnaireModel');
const Questions = require('../models/questionsModel');
const Answer = require('../models/answerModel');
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
            status: 1
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
        return response.responseHandlerWithMessage(res, 200, "Questionnaire Added Successfully");
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
    uploadImage,
}
