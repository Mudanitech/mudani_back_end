const Portfolio = require('../models/portfolioModel');
const Model = require('../models/modelModel');

const response = require('../utils/response');
const fileupload = require('../utils/fileupload');
const Joi = require('joi');
var mongodb = require("mongodb")


const createPortfolio = async (req, res) => {
    try {

        const schema = Joi.object({
            modelId: Joi.string().required(),
            name: Joi.string().required(),
            riskLevel: Joi.string().required(),
            drift: Joi.string().required(),
            description: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let portfolioObj = new Portfolio({
            modelId: req.body.modelId,
            name: req.body.name,
            riskLevel: req.body.riskLevel,
            drift: req.body.drift,
            description: req.body.description,
            status: 1
        });
        let saveData = await portfolioObj.save();
        if (saveData) {
            return response.responseHandlerWithMessage(res, 200, "Portfolio Added Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }
    } catch (error) {
        response.log("error is=========>", error);
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const portfolioList = async (req, res) => {
    try {
        // let result = await Portfolio.find({ status: 1 })

        const data = await Portfolio
            .aggregate([
                { $match: { $or: [{ "status": '1' }, { "status": 1 }] } },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1 } },

                            // { $project: { _id: 1, answer: 1 } },
                        ],
                        as: 'models'
                    }
                }
            ])


        response.responseHandlerWithData(res, 200, "Portfolio List", data);
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}

const portfolioDetail = async (req, res) => {
    try {
        let checkIdIsTrue = mongodb.ObjectID.isValid(req.params.id);
        if (!checkIdIsTrue) response.responseHandlerWithMessage(res, 203, "Invalid id");

        const data = await Portfolio
            .aggregate([
                { $match: { _id: mongodb.ObjectID(req.params.id), $or: [{ "status": '1' }, { "status": 1 }] } },
                {
                    $lookup: {
                        from: 'models',
                        let: { "modelId": "$modelId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$modelId"] } } },
                            { $project: { _id: 1, modelName: 1, models: 1, } },

                            // { $project: { _id: 1, answer: 1 } },
                        ],
                        as: 'models'
                    }
                }
            ])


        response.responseHandlerWithData(res, 200, "Portfolio List", data);
    } catch (error) {
        response.log("error is ==========>", error)
        return response.responseHandlerWithData(res, 500, "Internal Server Error");
    }
}


const editPortfolio = async (req, res) => {
    try {

        const schema = Joi.object({
            portfolioId: Joi.string().required(),
            modelId: Joi.string().required(),
            name: Joi.string().required(),
            riskLevel: Joi.string().required(),
            drift: Joi.string().required(),
            description: Joi.string().required(),
        })

        const { error } = await schema.validate(req.body);
        if (error) return response.responseHandlerWithMessage(res, 400, error.details[0].message);

        let portfolioObj = {
            modelId: req.body.modelId,
            name: req.body.name,
            riskLevel: req.body.riskLevel,
            drift: req.body.drift,
            description: req.body.description,
            status: 1
        }
        var saveQuestion = await Portfolio.findByIdAndUpdate({ _id: req.body.portfolioId }, portfolioObj, { new: true });

        if (saveQuestion) {
            return response.responseHandlerWithMessage(res, 200, "Portfolio Updated Successfully");
        } else {
            return response.responseHandlerWithMessage(res, 201, "Something went wrong.");
        }
    } catch (error) {
        response.log("error is=========>", error);
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
    createPortfolio,
    portfolioList,
    portfolioDetail,
    editPortfolio
}
